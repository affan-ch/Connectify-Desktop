"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { X, MoreHorizontal, Send, Info, Scroll } from "lucide-react";
import { AppIcon } from "@/models/AppIcon";
import { Notification, Action } from "@/models/Notification";
import { useState, useEffect } from "react";
import { getNotifications } from "@/db/notification";
import { getAppIcons } from "@/db/appIcon";
import Loader from "./loader";
import { ScrollArea } from "@/components/ui/scroll-area";

function formatTime(timestamp: number): string {
  const now = new Date();
  const date = new Date(timestamp);
  const isToday = now.toDateString() === date.toDateString();

  if (isToday) {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } else {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  }
}

function NotificationCard({
  notification,
  appIcon,
}: {
  notification: Notification;
  appIcon: AppIcon;
}) {
  const [replyText, setReplyText] = useState("");
  const [showReplyField, setShowReplyField] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  const actions: Action[] = notification.actions
    ? JSON.parse(notification.actions)
    : [];
  const hasReplyableAction = actions.some((action) => action.isReplyable);

  const handleActionClick = (action: Action) => {
    if (action.isReplyable) {
      setShowReplyField(true);
    } else {
      console.log(`Action clicked: ${action.title}`);
    }
  };

  const handleSendReply = () => {
    if (replyText.trim()) {
      console.log(`Reply sent: ${replyText}`);
      setReplyText("");
      setShowReplyField(false);
    }
  };

  return (
    <Card
      className="p-4 mb-3 hover:shadow-md transition-shadow relative w-full"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-start gap-3">
        <img
          src={
            appIcon.appIconBase64
              ? `data:image/png;base64,${appIcon.appIconBase64}`
              : "/placeholder.svg"
          }
          alt={appIcon.appName}
          className="w-8 h-8 rounded-lg flex-shrink-0"
        />

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <span className="text-sm text-muted-foreground">
              {appIcon.appName}
            </span>
            <div className="flex items-center gap-2">
              {!isHovered && (
                <span className="text-sm text-muted-foreground">
                  {formatTime(notification.postTime)}
                </span>
              )}
              {isHovered && (
                <div className="flex items-center">
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <h3 className="font-medium text-base mb-2">{notification.title}</h3>

          {notification.content && (
            <p className="text-sm text-muted-foreground mb-3 whitespace-pre-line">
              {notification.content}
            </p>
          )}

          {/* Reply field for replyable notifications */}
          {showReplyField && hasReplyableAction && (
            <div className="flex items-center gap-2 mb-3 p-2 border rounded-md">
              <Input
                placeholder="Enter a message"
                value={replyText}
                onChange={(e) => setReplyText(e.target.value)}
                className="flex-1 border-0 p-0 focus-visible:ring-0"
                onKeyPress={(e) => e.key === "Enter" && handleSendReply()}
              />
              <Button
                size="sm"
                variant="ghost"
                onClick={handleSendReply}
                disabled={!replyText.trim()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          )}

          {/* Action buttons */}
          {actions.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap">
              {actions.map((action) => (
                <Button
                  key={action.index}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 p-0 h-auto font-normal"
                  onClick={() => handleActionClick(action)}
                >
                  {action.title}
                </Button>
              ))}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export default function NotificationsUI() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [icons, setIcons] = useState<AppIcon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      const notifications = await getNotifications();
      const icons = await getAppIcons();
      setNotifications(notifications);
      setIcons(icons);
      setLoading(false);
    };

    fetchData();
  }, []);

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="  bg-gray-50 min-h-screen">
      <div className="bg-white rounded-lg shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-semibold">Notifications</h1>
            <Info className="h-4 w-4 text-muted-foreground" />
          </div>
          <Button variant="ghost" className="text-blue-600 hover:text-blue-700">
            Clear all
          </Button>
        </div>

<ScrollArea className="h-[570px] w-full">
        {/* Notifications List */}
        <div className="p-4 w-full">
          
          {notifications.map((notification) => {
            const appIcon = icons.find(
              (icon) => icon.id === notification.iconId
            );
            if (!appIcon) return null;

            return (
              <NotificationCard
                key={notification.id}
                notification={notification}
                appIcon={appIcon}
              />
            );
          })}
          
        </div>
        </ScrollArea>
      </div>
    </div>
  );
}
