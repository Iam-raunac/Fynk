import {
  getAllUsers,
  sendConnectionRequest,
} from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { getUserAvatar } from "@/utils/media";
import { useRouter } from "next/router";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";

export default function DiscoverPage() {
  const authState = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const router = useRouter();
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getAllUsers({ excludeMe: true, search, limit: 30 }));
    }
  }, [authState.isTokenThere, search, dispatch]);

  const connectionLabel = (status) => {
    if (status === "connected") return "Connected";
    if (status === "pending_sent") return "Requested";
    if (status === "pending_received") return "Respond";
    return "Connect";
  };

  const canRequest = (status) => status === "none" || status === "rejected";

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.discover}>
          <h1>Discover</h1>

          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className={styles.search}
            placeholder="Search people"
          />

          <div className={styles.grid}>
            {authState.all_users.map((profile) => (
              <div key={profile._id} className={styles.userCard}>
                <img src={getUserAvatar(profile.userId)} alt={profile.userId.name} />
                <div className={styles.userInfo}>
                  <p className={styles.name}>{profile.userId.name}</p>
                  <p className={styles.username}>@{profile.userId.username}</p>
                  {profile.currentPost && <p className={styles.role}>{profile.currentPost}</p>}
                </div>

                <div className={styles.actions}>
                  <button
                    type="button"
                    onClick={() => router.push(`/profile/${profile.userId.username}`)}
                    className={styles.secondaryButton}
                  >
                    View
                  </button>
                  <button
                    type="button"
                    disabled={!canRequest(profile.connectionStatus)}
                    onClick={() => dispatch(sendConnectionRequest(profile.userId._id))}
                    className={styles.primaryButton}
                  >
                    {connectionLabel(profile.connectionStatus)}
                  </button>
                </div>
              </div>
            ))}
          </div>

          {authState.all_profiles_fetched && authState.all_users.length === 0 && (
            <p className={styles.empty}>No profiles found</p>
          )}
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
