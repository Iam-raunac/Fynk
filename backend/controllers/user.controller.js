import crypto from "crypto";
import fs from "fs";
import bcrypt from "bcrypt";
import PDFDocument from "pdfkit";
import ConnectionRequest from "../models/connections.model.js";
import Post from "../models/posts.model.js";
import Profile from "../models/profile.model.js";
import User from "../models/user.model.js";
import { uploadFile } from "../config/upload.js";

const MAX_LIMIT = 50;

const getToken = (req) =>
  req.headers.authorization || req.query.token || req.body?.token || "";

const getPagination = (req, defaultLimit = 20) => {
  const page = Math.max(parseInt(req.query.page || req.body?.page || "1", 10), 1);
  const limit = Math.min(
    Math.max(parseInt(req.query.limit || req.body?.limit || `${defaultLimit}`, 10), 1),
    MAX_LIMIT
  );

  return {
    page,
    limit,
    skip: (page - 1) * limit,
  };
};

const normalizePastWork = (pastWork = []) =>
  pastWork.map((work) => ({
    company: work.company || "",
    position: work.position || work.postion || "",
    postion: work.position || work.postion || "",
    years: work.years || "",
  }));

const normalizeEducation = (education = []) =>
  education.map((item) => ({
    school: item.school || "",
    degree: item.degree || "",
    fieldOfStudy: item.fieldOfStudy || item.years || "",
  }));

const convertUserDataTOPDF = async (userData) => {
  const doc = new PDFDocument();
  const outputPath = crypto.randomBytes(32).toString("hex") + ".pdf";
  const stream = fs.createWriteStream("uploads/" + outputPath);

  doc.pipe(stream);

  const profilePicture = userData.userId.profilePicture || "";
  if (profilePicture && !profilePicture.startsWith("http")) {
    const imagePath = `uploads/${profilePicture}`;
    if (fs.existsSync(imagePath)) {
      doc.image(imagePath, { align: "center", width: 100 });
    }
  }

  doc.fontSize(14).text(`Name: ${userData.userId.name}`);
  doc.fontSize(14).text(`Username: ${userData.userId.username}`);
  doc.fontSize(14).text(`Email: ${userData.userId.email}`);
  doc.fontSize(14).text(`Bio: ${userData.bio || ""}`);
  doc.fontSize(14).text(`Current Position: ${userData.currentPost || ""}`);

  doc.moveDown();
  doc.fontSize(14).text("Past Work:");
  userData.pastWork.forEach((work) => {
    doc.fontSize(12).text(`Company: ${work.company || ""}`);
    doc.fontSize(12).text(`Position: ${work.position || work.postion || ""}`);
    doc.fontSize(12).text(`Years: ${work.years || ""}`);
    doc.moveDown(0.5);
  });

  doc.moveDown();
  doc.fontSize(14).text("Education:");
  userData.education.forEach((education) => {
    doc.fontSize(12).text(`School: ${education.school || ""}`);
    doc.fontSize(12).text(`Degree: ${education.degree || ""}`);
    doc.fontSize(12).text(`Field: ${education.fieldOfStudy || ""}`);
    doc.moveDown(0.5);
  });

  doc.end();

  await new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });

  return outputPath;
};

const findUserByToken = async (token) => {
  if (!token) return null;
  return User.findOne({ token }).select("_id name username email profilePicture").lean();
};

const attachConnectionStatus = async (profiles, currentUserId) => {
  if (!currentUserId || profiles.length === 0) {
    return profiles.map((profile) => ({ ...profile, connectionStatus: "none" }));
  }

  const profileUserIds = profiles
    .map((profile) => profile.userId?._id)
    .filter(Boolean)
    .map(String)
    .filter((id) => id !== String(currentUserId));

  const requests = await ConnectionRequest.find({
    $or: [
      { userId: currentUserId, connectionId: { $in: profileUserIds } },
      { connectionId: currentUserId, userId: { $in: profileUserIds } },
    ],
  }).lean();

  const statusByUserId = new Map();
  requests.forEach((request) => {
    const outgoing = String(request.userId) === String(currentUserId);
    const otherUserId = outgoing ? String(request.connectionId) : String(request.userId);

    if (request.status_accepted === true) {
      statusByUserId.set(otherUserId, "connected");
      return;
    }

    if (request.status_accepted === false) {
      statusByUserId.set(otherUserId, "rejected");
      return;
    }

    statusByUserId.set(otherUserId, outgoing ? "pending_sent" : "pending_received");
  });

  return profiles.map((profile) => {
    const profileUserId = String(profile.userId?._id || "");
    return {
      ...profile,
      connectionStatus:
        profileUserId === String(currentUserId)
          ? "self"
          : statusByUserId.get(profileUserId) || "none",
    };
  });
};

export const register = async (req, res) => {
  try {
    const { name, email, password, username } = req.body;

    if (!name || !email || !password || !username) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({
      $or: [{ email }, { username }],
    }).lean();

    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = await User.create({
      name,
      email,
      password: hashedPassword,
      username,
    });

    await Profile.create({ userId: newUser._id });

    return res.json({ message: "User registered successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const login = async (req, res) => {
  try {
    console.log("LOGIN HIT");

    console.log(req.body);
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    const token = crypto.randomBytes(32).toString("hex");
    user.token = token;
    await user.save();

    return res.json({ token });
  } catch (error) {
    // return res.status(500).json({ message: error.message });
    console.error("LOGIN ERROR:", error);
    return res.status(500).json({

      message: error.message,
  
      stack: error.stack
  
    });
  }
};

export const uploadProfilePicture = async (req, res) => {
  const token = getToken(req);

  try {
    const user = await User.findOne({ token });

    if (!user) return res.status(404).json({ message: "User not found" });
    if (!req.file) return res.status(400).json({ message: "Profile picture is required" });

    const uploaded = await uploadFile(req.file, "fynk/profile-pictures");
    user.profilePicture = uploaded.mediaUrl || uploaded.media;

    await user.save();

    return res.json({
      message: "Profile picture Updated",
      profilePicture: user.profilePicture,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateUserProfile = async (req, res) => {
  try {
    const { token, ...newUserData } = req.body;

    const user = await User.findOne({ token });

    if (!user) return res.status(404).json({ message: "User not found" });

    const allowedUpdates = {};
    ["name", "username", "email"].forEach((field) => {
      if (newUserData[field]) allowedUpdates[field] = newUserData[field];
    });

    if (allowedUpdates.username || allowedUpdates.email) {
      const existingUser = await User.findOne({
        $or: [
          allowedUpdates.username ? { username: allowedUpdates.username } : null,
          allowedUpdates.email ? { email: allowedUpdates.email } : null,
        ].filter(Boolean),
      });

      if (existingUser && String(existingUser._id) !== String(user._id)) {
        return res.status(400).json({ message: "Username or email already exists" });
      }
    }

    Object.assign(user, allowedUpdates);
    await user.save();

    return res.json({ message: "User Updated" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getUserAndProfile = async (req, res) => {
  try {
    const { username } = req.query;
    const token = getToken(req);

    const user = username
      ? await User.findOne({ username })
      : await User.findOne({ token });

    if (!user) return res.status(404).json({ message: "User not found" });

    let userProfile = await Profile.findOne({ userId: user._id }).populate(
      "userId",
      "name email username profilePicture"
    );

    if (!userProfile) {
      userProfile = await Profile.create({ userId: user._id });
      userProfile = await Profile.findOne({ userId: user._id }).populate(
        "userId",
        "name email username profilePicture"
      );
    }

    return res.json(userProfile);
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getProfileByUsername = async (req, res) => {
  try {
    const { username } = req.params;
    const currentUser = await findUserByToken(getToken(req));

    const user = await User.findOne({ username })
      .select("_id name email username profilePicture")
      .lean();

    if (!user) return res.status(404).json({ message: "User not found" });

    let profile = await Profile.findOne({ userId: user._id })
      .populate("userId", "name email username profilePicture")
      .lean();

    if (!profile) {
      await Profile.create({ userId: user._id });
      profile = await Profile.findOne({ userId: user._id })
        .populate("userId", "name email username profilePicture")
        .lean();
    }

    const [profileWithStatus] = await attachConnectionStatus(
      [profile],
      currentUser?._id
    );

    const postCount = await Post.countDocuments({ userId: user._id, active: true });

    return res.json({
      profile: profileWithStatus,
      isOwner: Boolean(currentUser && String(currentUser._id) === String(user._id)),
      postCount,
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const updateProfileData = async (req, res) => {
  try {
    const { token, ...newprofileData } = req.body;
    const user = await User.findOne({ token });

    if (!user) return res.status(404).json({ message: "User not found" });

    let profileToUpdate = await Profile.findOne({ userId: user._id });
    if (!profileToUpdate) {
      profileToUpdate = await Profile.create({ userId: user._id });
    }

    const allowedProfileData = {};
    if (typeof newprofileData.bio === "string") allowedProfileData.bio = newprofileData.bio;
    if (typeof newprofileData.currentPost === "string") {
      allowedProfileData.currentPost = newprofileData.currentPost;
    }
    if (Array.isArray(newprofileData.pastWork)) {
      allowedProfileData.pastWork = normalizePastWork(newprofileData.pastWork);
    }
    if (Array.isArray(newprofileData.education)) {
      allowedProfileData.education = normalizeEducation(newprofileData.education);
    }

    Object.assign(profileToUpdate, allowedProfileData);
    await profileToUpdate.save();

    return res.json({ message: "Profile Updated", profile: profileToUpdate });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAllUserProfiles = async (req, res) => {
  try {
    const { page, limit, skip } = getPagination(req);
    const search = (req.query.search || "").trim();
    const currentUser = await findUserByToken(getToken(req));
    const excludeMe = req.query.excludeMe === "true";

    const userFilter = {};
    if (search) {
      userFilter.$or = [
        { name: { $regex: search, $options: "i" } },
        { username: { $regex: search, $options: "i" } },
      ];
    }
    if (excludeMe && currentUser) {
      userFilter._id = { $ne: currentUser._id };
    }

    const users = await User.find(userFilter)
      .select("_id")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean();

    const userIds = users.map((user) => user._id);
    const [profilesRaw, total] = await Promise.all([
      Profile.find({ userId: { $in: userIds } })
        .populate("userId", "name username email profilePicture")
        .lean(),
      User.countDocuments(userFilter),
    ]);

    const order = new Map(userIds.map((id, index) => [String(id), index]));
    const profiles = profilesRaw.sort(
      (a, b) => order.get(String(a.userId._id)) - order.get(String(b.userId._id))
    );

    const profilesWithStatus = await attachConnectionStatus(profiles, currentUser?._id);

    return res.json({
      profiles: profilesWithStatus,
      pagination: {
        page,
        limit,
        total,
        hasMore: skip + profiles.length < total,
      },
    });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const dowloadProfile = async (req, res) => {
  try {
    const user_id = req.query.id;

    const userProfile = await Profile.findOne({ userId: user_id }).populate(
      "userId",
      "name username email profilePicture"
    );

    if (!userProfile) {
      return res.status(404).json({ message: "Profile not found" });
    }

    const outputPath = await convertUserDataTOPDF(userProfile);

    return res.json({ message: outputPath });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const sendConnectionRequest = async (req, res) => {
  const { connectionId } = req.body;
  const token = getToken(req);

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    if (String(user._id) === String(connectionId)) {
      return res.status(400).json({ message: "You cannot connect with yourself" });
    }

    const connectionUser = await User.findById(connectionId).select("_id");
    if (!connectionUser) {
      return res.status(404).json({ message: "Connection user not found" });
    }

    const existingRequest = await ConnectionRequest.findOne({
      $or: [
        { userId: user._id, connectionId: connectionUser._id },
        { userId: connectionUser._id, connectionId: user._id },
      ],
    });

    if (existingRequest) {
      if (existingRequest.status_accepted === true) {
        return res.status(400).json({ message: "You are already connected" });
      }

      const isReverseRequest =
        String(existingRequest.userId) === String(connectionUser._id) &&
        String(existingRequest.connectionId) === String(user._id);

      if (isReverseRequest && existingRequest.status_accepted === null) {
        existingRequest.status_accepted = true;
        await existingRequest.save();
        return res.json({ message: "Connection request accepted successfully" });
      }

      if (existingRequest.status_accepted === null) {
        return res.status(400).json({ message: "Connection request already sent" });
      }

      existingRequest.userId = user._id;
      existingRequest.connectionId = connectionUser._id;
      existingRequest.status_accepted = null;
      await existingRequest.save();
      return res.json({ message: "Connection request sent successfully" });
    }

    await ConnectionRequest.create({
      userId: user._id,
      connectionId: connectionUser._id,
    });

    return res.json({ message: "Connection request sent successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getMyConnectionsRequest = async (req, res) => {
  const token = getToken(req);

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({ userId: user._id })
      .sort({ createdAt: -1 })
      .populate("connectionId", "name username email profilePicture")
      .lean();

    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const whatAreMyConnections = async (req, res) => {
  const token = getToken(req);

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      connectionId: user._id,
      status_accepted: null,
    })
      .sort({ createdAt: -1 })
      .populate("userId", "name username email profilePicture")
      .lean();

    return res.json({ connections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const getAcceptedConnections = async (req, res) => {
  const token = getToken(req);

  try {
    const user = await User.findOne({ token }).select("_id");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connections = await ConnectionRequest.find({
      status_accepted: true,
      $or: [{ userId: user._id }, { connectionId: user._id }],
    })
      .sort({ updatedAt: -1 })
      .populate("userId", "name username email profilePicture")
      .populate("connectionId", "name username email profilePicture")
      .lean();

    const normalizedConnections = connections.map((connection) => {
      const otherUser =
        String(connection.userId._id) === String(user._id)
          ? connection.connectionId
          : connection.userId;

      return {
        ...connection,
        otherUser,
      };
    });

    return res.json({ connections: normalizedConnections });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const acceptConnectionRequest = async (req, res) => {
  const { requestId, action_type } = req.body;
  const token = getToken(req);

  try {
    const user = await User.findOne({ token }).select("_id");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const connection = await ConnectionRequest.findOne({
      _id: requestId,
      connectionId: user._id,
    });

    if (!connection) {
      return res.status(404).json({ message: "Connection request not found" });
    }

    connection.status_accepted = action_type === "accept";
    await connection.save();

    return res.json({ message: "Connection request updated successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
