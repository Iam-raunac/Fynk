import {
  getAcceptedConnections,
  getIncomingConnectionRequests,
  getSentConnectionRequests,
  respondConnectionRequest,
} from "@/config/redux/action/authAction";
import DashboardLayout from "@/layout/DashboardLayout";
import UserLayout from "@/layout/UserLayout";
import { getUserAvatar } from "@/utils/media";
import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import styles from "./style.module.css";

export default function MyConnectionsPage() {
  const dispatch = useDispatch();
  const router = useRouter();
  const authState = useSelector((state) => state.auth);

  useEffect(() => {
    if (authState.isTokenThere) {
      dispatch(getIncomingConnectionRequests());
      dispatch(getSentConnectionRequests());
      dispatch(getAcceptedConnections());
    }
  }, [authState.isTokenThere, dispatch]);

  const refreshConnections = async () => {
    await dispatch(getIncomingConnectionRequests());
    await dispatch(getSentConnectionRequests());
    await dispatch(getAcceptedConnections());
  };

  const handleRespond = async (requestId, actionType) => {
    await dispatch(respondConnectionRequest({ requestId, actionType }));
    refreshConnections();
  };

  return (
    <UserLayout>
      <DashboardLayout>
        <div className={styles.connections}>
          <h1>My Connections</h1>

          <section className={styles.section}>
            <h2>Requests</h2>
            {authState.connectionRequests.length === 0 && (
              <p className={styles.empty}>No pending requests</p>
            )}
            {authState.connectionRequests.map((request) => (
              <div key={request._id} className={styles.row}>
                <img src={getUserAvatar(request.userId)} alt={request.userId.name} />
                <div className={styles.info}>
                  <p>{request.userId.name}</p>
                  <span>@{request.userId.username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => handleRespond(request._id, "accept")}
                  className={styles.primaryButton}
                >
                  Accept
                </button>
                <button
                  type="button"
                  onClick={() => handleRespond(request._id, "reject")}
                  className={styles.secondaryButton}
                >
                  Reject
                </button>
              </div>
            ))}
          </section>

          <section className={styles.section}>
            <h2>Connections</h2>
            {authState.connections.length === 0 && (
              <p className={styles.empty}>No connections yet</p>
            )}
            {authState.connections.map((connection) => (
              <div key={connection._id} className={styles.row}>
                <img src={getUserAvatar(connection.otherUser)} alt={connection.otherUser.name} />
                <div className={styles.info}>
                  <p>{connection.otherUser.name}</p>
                  <span>@{connection.otherUser.username}</span>
                </div>
                <button
                  type="button"
                  onClick={() => router.push(`/profile/${connection.otherUser.username}`)}
                  className={styles.secondaryButton}
                >
                  View
                </button>
              </div>
            ))}
          </section>

          <section className={styles.section}>
            <h2>Sent</h2>
            {authState.sentConnectionRequests.length === 0 && (
              <p className={styles.empty}>No sent requests</p>
            )}
            {authState.sentConnectionRequests.map((request) => (
              <div key={request._id} className={styles.row}>
                <img src={getUserAvatar(request.connectionId)} alt={request.connectionId.name} />
                <div className={styles.info}>
                  <p>{request.connectionId.name}</p>
                  <span>
                    {request.status_accepted === true
                      ? "Accepted"
                      : request.status_accepted === false
                        ? "Rejected"
                        : "Pending"}
                  </span>
                </div>
              </div>
            ))}
          </section>
        </div>
      </DashboardLayout>
    </UserLayout>
  );
}
