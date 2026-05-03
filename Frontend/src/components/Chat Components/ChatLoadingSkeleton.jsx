const ChatLoadingSkeleton = () => {
  return (
    <div className="flex flex-col gap-4 p-4 h-full bg-base-100">
      {/* Received Message Skeleton */}
      <div className="flex items-start gap-3">
        <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
        <div className="flex flex-col gap-2">
          <div className="skeleton h-4 w-24"></div>
          <div className="skeleton h-12 w-48 md:w-64"></div>
        </div>
      </div>

      {/* Sent Message Skeleton */}
      <div className="flex items-start gap-3 justify-end">
        <div className="flex flex-col gap-2 items-end">
          <div className="skeleton h-12 w-40 md:w-56"></div>
        </div>
        <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
      </div>

      {/* Another Received */}
      <div className="flex items-start gap-3">
        <div className="skeleton w-10 h-10 rounded-full shrink-0"></div>
        <div className="skeleton h-20 w-full max-w-[300px]"></div>
      </div>
    </div>
  );
};

export default ChatLoadingSkeleton;
