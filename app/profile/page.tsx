"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Loader2, LogOut, Save, X } from "lucide-react";
import { useRouter } from "next/navigation";
import clsx from "clsx";

const generateAvatarUrls = (seed: string) => {
  const styles = [
    "adventurer",
    "bottts",
    "fun-emoji",
    "pixel-art",
    "thumbs",
    "notionists",
  ];
  return styles.map(
    (style) =>
      `https://api.dicebear.com/7.x/${style}/svg?seed=${encodeURIComponent(
        seed,
      )}`,
  );
};

export default function ProfilePage() {
  const router = useRouter();

  const [user, setUser] = useState<any>(null);
  const [displayName, setDisplayName] = useState("");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [bio, setBio] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  const [avatarOptions, setAvatarOptions] = useState<string[]>([]);

  useEffect(() => {
    const fetchProfile = async () => {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/profile`,
        {
          method: "GET",
          credentials: "include",
        },
      );

      if (response.status === 401) {
        router.push("/");
        return;
      }

      if (response.ok) {
        const { user, profile } = await response.json();

        setUser(user);
        const seed = user.email || user.id;
        const avatars = generateAvatarUrls(seed);
        setAvatarOptions(avatars);
        setDisplayName(profile.display_name || "");
        setAvatarUrl(profile.avatar_url || avatars[0]);
        setBio(profile.bio || "");
      } else {
        router.push("/");
      }

      setLoading(false);
    };

    fetchProfile();
  }, []);

  const handleSave = async () => {
    setSaving(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/profile`,
        {
          method: "POST",
          credentials: "include", // Include the session cookie for authentication
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            display_name: displayName,
            avatar_url: avatarUrl,
            bio,
          }),
        },
      );

      if (response.ok) {
        setSaving(false);
        // Handle success, show a message, etc.
      } else {
        // Handle error
        setSaving(false);
        console.log("Error updating profile");
      }
    } catch (error) {
      setSaving(false);
      console.log("Error:", error);
    }
  };

  const handleLogout = async () => {
    try {
      // Make POST request to backend to log out
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}api/logout`,
        {
          method: "POST",
          credentials: "include", // Include cookies for authentication
        },
      );

      if (response.ok) {
        router.push("/");
      } else {
        console.error("Error during logout");
      }
    } catch (error) {
      console.error("Logout Error:", error);
    }
  };

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="animate-spin w-6 h-6 mr-2" />
        Loading profile...
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Card className="p-6 space-y-6">
        <div className="flex justify-end">
          <Button
            variant="close"
            size="sm"
            onClick={() => {
              router.back();
            }}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-4">
          <img
            src={avatarUrl}
            alt="Avatar"
            className="w-16 h-16 rounded-full border"
          />
          <div>
            <h1 className="text-lg font-semibold">
              {displayName || user.email}
            </h1>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <Label htmlFor="display_name">Display Name</Label>
            <Input
              id="display_name"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
              placeholder="Your name"
            />
          </div>

          <div>
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us something about yourself..."
            />
          </div>

          <div>
            <Label className="mb-2 block">Choose Your Avatar</Label>
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
              {avatarOptions.map((url) => (
                <button
                  key={url}
                  onClick={() => setAvatarUrl(url)}
                  className={clsx(
                    "rounded-full transition-all overflow-hidden w-15 h-15",
                    avatarUrl === url
                      ? "border-primary ring-2 ring-primary"
                      : "border-muted",
                  )}
                >
                  <img src={url} alt="avatar" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="flex justify-between pt-4">
          <Button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2"
          >
            {saving && <Loader2 className="h-4 w-4 animate-spin" />}
            <Save className="w-4 h-4" />
            Save Changes
          </Button>

          <Button
            variant="destructive"
            onClick={handleLogout}
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Logout
          </Button>
        </div>
      </Card>
    </div>
  );
}
