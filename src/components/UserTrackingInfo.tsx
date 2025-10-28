import { useUserTracking } from '@/hooks/useUserTracking';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Loader2, RefreshCw, Trash2 } from 'lucide-react';

export default function UserTrackingInfo() {
  const { currentUserData, allUserData, isLoading, error, refreshData, clearData } = useUserTracking();

  if (error) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle className="text-destructive">Error Loading User Data</CardTitle>
          <CardDescription>{error.message}</CardDescription>
        </CardHeader>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>User Information</CardTitle>
            <CardDescription>
              Browser details, location, and system information
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="icon"
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            <Button
              variant="outline"
              size="icon"
              onClick={clearData}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : currentUserData ? (
          <div className="space-y-6">
            {/* Current Session Info */}
            <div className="space-y-4">
              <h3 className="font-medium">Current Session</h3>
              <div className="grid gap-4 text-sm">
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="font-medium">IP Address:</span>
                  <span className="col-span-2">{currentUserData.ipAddress}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="font-medium">Location:</span>
                  <span className="col-span-2">
                    {currentUserData.location.city}, {currentUserData.location.region},{' '}
                    {currentUserData.location.country}
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="font-medium">Browser:</span>
                  <span className="col-span-2">{currentUserData.browserInfo.userAgent}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="font-medium">Screen:</span>
                  <span className="col-span-2">{currentUserData.browserInfo.screenResolution}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="font-medium">Language:</span>
                  <span className="col-span-2">{currentUserData.browserInfo.language}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="font-medium">Platform:</span>
                  <span className="col-span-2">{currentUserData.browserInfo.platform}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="font-medium">Time Zone:</span>
                  <span className="col-span-2">{currentUserData.browserInfo.timeZone}</span>
                </div>
                <div className="grid grid-cols-3 gap-4 items-center">
                  <span className="font-medium">Online Status:</span>
                  <span className="col-span-2">
                    {currentUserData.browserInfo.isOnline ? 'Online' : 'Offline'}
                  </span>
                </div>
                {currentUserData.referrer && (
                  <div className="grid grid-cols-3 gap-4 items-center">
                    <span className="font-medium">Referrer:</span>
                    <span className="col-span-2">{currentUserData.referrer}</span>
                  </div>
                )}
              </div>
            </div>

            {/* History */}
            {allUserData.length > 1 && (
              <div className="space-y-4">
                <h3 className="font-medium">History</h3>
                <ScrollArea className="h-[200px] rounded-md border p-4">
                  <div className="space-y-4">
                    {allUserData.slice().reverse().map((data, index) => (
                      <div key={data.timestamp} className="text-sm space-y-1">
                        <div className="flex justify-between text-muted-foreground">
                          <span>{new Date(data.timestamp).toLocaleString()}</span>
                          <span>{data.ipAddress}</span>
                        </div>
                        <div className="text-xs">
                          {data.location.city}, {data.location.country}
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </div>
            )}
          </div>
        ) : (
          <div className="py-8 text-center text-muted-foreground">
            No user data available
          </div>
        )}
      </CardContent>
    </Card>
  );
}