import { RedisTest } from "@/components/debug/redis-test"
import { RedisConfiguration } from "@/components/settings/redis-configuration"

export default function RedisDebugPage() {
  return (
    <div className="container mx-auto py-6 space-y-8">
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">Redis Debug</h1>
        <p className="text-muted-foreground">Configure and test your Redis connection</p>
      </div>

      <div className="grid gap-6 md:grid-cols-1 lg:grid-cols-1">
        <RedisConfiguration />
        <RedisTest />
      </div>
    </div>
  )
}
