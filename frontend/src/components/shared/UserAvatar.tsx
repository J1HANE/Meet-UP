interface UserAvatarProps {
  name: string;
  avatarUrl?: string | null;
  email?: string;
  size?: "sm" | "md" | "lg";
}

function UserAvatar({ name, avatarUrl, size = "md" }: UserAvatarProps) {
  const sizeClasses = {
    sm: "w-6 h-6 text-xs",
    md: "w-9 h-9 text-sm",
    lg: "w-12 h-12 text-base",
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 3);
  };

  const initials = getInitials(name);

  return (
    <div
      className={`${sizeClasses[size]} rounded-full flex items-center justify-center overflow-hidden shrink-0`}
    >
      {avatarUrl ? (
        <img
          src={avatarUrl}
          alt={name}
          className='w-full h-full object-cover'
          onError={(e) => {
            // If image fails to load, replace with initials
            const target = e.target as HTMLImageElement;
            target.style.display = "none";
            const parent = target.parentElement;
            if (parent) {
              const fallback = document.createElement("span");
              fallback.className =
                "w-full h-full flex items-center justify-center bg-primary/20 text-primary font-medium";
              fallback.textContent = initials;
              parent.appendChild(fallback);
            }
          }}
        />
      ) : (
        <span className='w-full h-full flex items-center justify-center bg-primary/20 text-primary font-medium'>
          {initials}
        </span>
      )}
    </div>
  );
}

export default UserAvatar;
