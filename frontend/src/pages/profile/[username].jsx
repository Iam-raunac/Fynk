import PostCard from "@/components/PostCard";
import { clientServer } from "@/config";
import {
  getAboutUser,
  getProfileByUsername,
  sendConnectionRequest,
  updateProfileData,
  uploadProfilePicture,
} from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { getMediaUrl, getUserAvatar } from "@/utils/media";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";

const emptyWork = { company: "", position: "", years: "" };
const emptyEducation = { school: "", degree: "", fieldOfStudy: "" };

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  const dispatch = useDispatch();
  const authState = useSelector((state) => state.auth);
  const profileData = authState.viewedProfile;
  const profile = profileData?.profile;
  const isOwner = Boolean(profileData?.isOwner);

  const [posts, setPosts] = useState([]);
  const [editing, setEditing] = useState(false);
  const [bio, setBio] = useState("");
  const [currentPost, setCurrentPost] = useState("");
  const [pastWork, setPastWork] = useState([]);
  const [education, setEducation] = useState([]);

  useEffect(() => {
    if (!router.isReady || !username) return;
    dispatch(getProfileByUsername(username));

    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      const response = await clientServer.get(`/posts/user/${username}`, {
        params: { token, limit: 20 },
      });
      setPosts(response.data.posts || []);
    };

    fetchPosts().catch(() => setPosts([]));
  }, [router.isReady, username, dispatch]);

  useEffect(() => {
    if (authState.isTokenThere && !authState.profileFetched) {
      dispatch(getAboutUser({ token: localStorage.getItem("token") }));
    }
  }, [authState.isTokenThere, authState.profileFetched, dispatch]);

  useEffect(() => {
    if (!profile) return;
    setBio(profile.bio || "");
    setCurrentPost(profile.currentPost || "");
    setPastWork(
      profile.pastWork?.length
        ? profile.pastWork.map((work) => ({
            company: work.company || "",
            position: work.position || work.postion || "",
            years: work.years || "",
          }))
        : []
    );
    setEducation(profile.education || []);
  }, [profile]);

  const refreshProfile = async () => {
    await dispatch(getProfileByUsername(username));
    await dispatch(getAboutUser({ token: localStorage.getItem("token") }));
  };

  const handleSave = async () => {
    await dispatch(
      updateProfileData({
        bio,
        currentPost,
        pastWork,
        education,
      })
    );
    setEditing(false);
    refreshProfile();
  };

  const handleUploadPicture = async (file) => {
    if (!file) return;
    await dispatch(uploadProfilePicture(file));
    refreshProfile();
  };

  const handleResumeDownload = async () => {
    const response = await clientServer.get("/user/download_resume", {
      params: { id: profile.userId._id },
    });
    window.open(getMediaUrl(response.data.message), "_blank");
  };

  const updateWork = (index, field, value) => {
    setPastWork((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const updateEducation = (index, field, value) => {
    setEducation((items) =>
      items.map((item, itemIndex) =>
        itemIndex === index ? { ...item, [field]: value } : item
      )
    );
  };

  const connectionLabel = profile?.connectionStatus === "pending_sent"
    ? "Requested"
    : profile?.connectionStatus === "connected"
      ? "Connected"
      : "Connect";

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.profilePage}>
          {authState.viewedProfileLoading && <h2>Loading...</h2>}

          {profile && (
            <>
              <div className={styles.header}>
                <div className={styles.avatarWrap}>
                  <img src={getUserAvatar(profile.userId)} alt={profile.userId.name} />
                  {isOwner && (
                    <label className={styles.avatarAction}>
                      Change
                      <input
                        type="file"
                        hidden
                        accept="image/*"
                        onChange={(e) => handleUploadPicture(e.target.files?.[0])}
                      />
                    </label>
                  )}
                </div>

                <div className={styles.headerInfo}>
                  <h1>{profile.userId.name}</h1>
                  <p>@{profile.userId.username}</p>
                  <span>{profile.currentPost || "Fynk member"}</span>
                </div>

                <div className={styles.headerActions}>
                  {isOwner ? (
                    <button
                      type="button"
                      onClick={() => setEditing((prev) => !prev)}
                      className={styles.secondaryButton}
                    >
                      {editing ? "Cancel" : "Edit"}
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={profile.connectionStatus !== "none" && profile.connectionStatus !== "rejected"}
                      onClick={() => dispatch(sendConnectionRequest(profile.userId._id))}
                      className={styles.primaryButton}
                    >
                      {connectionLabel}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleResumeDownload}
                    className={styles.secondaryButton}
                  >
                    Resume
                  </button>
                </div>
              </div>

              {editing ? (
                <div className={styles.editPanel}>
                  <label>
                    Bio
                    <textarea value={bio} onChange={(e) => setBio(e.target.value)} />
                  </label>

                  <label>
                    Current Position
                    <input value={currentPost} onChange={(e) => setCurrentPost(e.target.value)} />
                  </label>

                  <div className={styles.editGroup}>
                    <div className={styles.groupHeader}>
                      <h2>Work</h2>
                      <button type="button" onClick={() => setPastWork((items) => [...items, emptyWork])}>
                        Add
                      </button>
                    </div>
                    {pastWork.map((work, index) => (
                      <div key={index} className={styles.threeGrid}>
                        <input
                          placeholder="Company"
                          value={work.company}
                          onChange={(e) => updateWork(index, "company", e.target.value)}
                        />
                        <input
                          placeholder="Position"
                          value={work.position}
                          onChange={(e) => updateWork(index, "position", e.target.value)}
                        />
                        <input
                          placeholder="Years"
                          value={work.years}
                          onChange={(e) => updateWork(index, "years", e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <div className={styles.editGroup}>
                    <div className={styles.groupHeader}>
                      <h2>Education</h2>
                      <button
                        type="button"
                        onClick={() => setEducation((items) => [...items, emptyEducation])}
                      >
                        Add
                      </button>
                    </div>
                    {education.map((item, index) => (
                      <div key={index} className={styles.threeGrid}>
                        <input
                          placeholder="School"
                          value={item.school}
                          onChange={(e) => updateEducation(index, "school", e.target.value)}
                        />
                        <input
                          placeholder="Degree"
                          value={item.degree}
                          onChange={(e) => updateEducation(index, "degree", e.target.value)}
                        />
                        <input
                          placeholder="Field"
                          value={item.fieldOfStudy}
                          onChange={(e) => updateEducation(index, "fieldOfStudy", e.target.value)}
                        />
                      </div>
                    ))}
                  </div>

                  <button type="button" onClick={handleSave} className={styles.primaryButton}>
                    Save
                  </button>
                </div>
              ) : (
                <div className={styles.details}>
                  <section>
                    <h2>About</h2>
                    <p>{profile.bio || "No bio yet"}</p>
                  </section>

                  <section>
                    <h2>Work</h2>
                    {profile.pastWork?.length === 0 && <p>No work history yet</p>}
                    {profile.pastWork?.map((work, index) => (
                      <div key={index} className={styles.detailRow}>
                        <strong>{work.position || work.postion || "Role"}</strong>
                        <span>{work.company || "Company"}</span>
                        <p>{work.years}</p>
                      </div>
                    ))}
                  </section>

                  <section>
                    <h2>Education</h2>
                    {profile.education?.length === 0 && <p>No education added yet</p>}
                    {profile.education?.map((item, index) => (
                      <div key={index} className={styles.detailRow}>
                        <strong>{item.school || "School"}</strong>
                        <span>{item.degree}</span>
                        <p>{item.fieldOfStudy}</p>
                      </div>
                    ))}
                  </section>
                </div>
              )}

              <div className={styles.posts}>
                <h2>Posts</h2>
                {posts.length === 0 && <p className={styles.empty}>No posts yet</p>}
                {posts.map((post) => (
                  <PostCard
                    key={post._id}
                    post={post}
                    currentUser={authState.user?.userId}
                    onDeleted={(postId) =>
                      setPosts((items) => items.filter((item) => item._id !== postId))
                    }
                  />
                ))}
              </div>
            </>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
