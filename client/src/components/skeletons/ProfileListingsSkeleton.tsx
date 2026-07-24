export const ProfileListingsSkeleton = () => {
    return (
    <div className="space-y-8 animate-pulse">
      <div className="flex justify-between items-center">
        <div className="space-y-2">
          <div className="h-8 bg-muted rounded-full w-48" />
          <div className="h-4 bg-muted/50 rounded-full w-80" />
        </div>
        <div className="flex gap-3">
          <div className="h-10 bg-muted rounded-full w-32" />
          <div className="h-10 bg-muted rounded-full w-24" />
        </div>
      </div>
      <div className="flex gap-6 border-b border-border/30 pb-2">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-5 bg-muted rounded-full w-20" />)}
      </div>
      <div className="grid gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="bg-card p-6 rounded-[2.5rem] border border-border/30 shadow-sm flex flex-col md:flex-row gap-6">
            <div className="w-28 h-28 rounded-2xl bg-muted/50 shrink-0" />
            <div className="flex-1 space-y-3">
              <div className="h-5 bg-muted rounded-full w-48" />
              <div className="h-4 bg-muted-light/80 rounded-full w-32" />
              <div className="h-4 bg-muted/50 rounded-full w-56 mt-4" />
            </div>
            <div className="w-48 flex flex-col items-end gap-2 shrink-0">
              <div className="h-5 bg-muted rounded-full w-32" />
              <div className="h-9 bg-muted-light/80 rounded-full w-28 mt-2" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}