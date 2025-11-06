import { PricingTable } from '@clerk/nextjs'
import { auth } from '@clerk/nextjs/server'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

export default async function PricingPage() {
  const { userId } = await auth()

  return (
    <div className="container mx-auto py-10 px-4">
      <div className="max-w-4xl mx-auto space-y-8">
        {/* Header Section */}
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-bold tracking-tight">Choose Your Plan</h1>
          <p className="text-xl text-muted-foreground">
            Select the perfect plan for your flashcard learning journey
          </p>
        </div>

        {/* Features Comparison */}
        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader>
              <CardTitle>Free Plan</CardTitle>
              <CardDescription>Perfect for getting started</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Up to 3 decks
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Unlimited cards per deck
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Study mode
                </li>
                <li className="flex items-center text-muted-foreground">
                  <span className="mr-2">✗</span>
                  AI flashcard generation
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-primary">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                Pro Plan
                <span className="text-xs bg-primary text-primary-foreground px-2 py-1 rounded">
                  Popular
                </span>
              </CardTitle>
              <CardDescription>Unlock unlimited learning</CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-2 text-sm">
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Unlimited decks
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Unlimited cards
                </li>
                <li className="flex items-center">
                  <span className="mr-2">✓</span>
                  Study mode
                </li>
                <li className="flex items-center font-semibold">
                  <span className="mr-2">✓</span>
                  AI flashcard generation ✨
                </li>
              </ul>
            </CardContent>
          </Card>
        </div>

        {/* Pricing Table */}
        <div className="bg-background">
          <PricingTable />
        </div>

        {/* Additional Info */}
        {!userId && (
          <p className="text-center text-sm text-muted-foreground">
            Sign in to manage your subscription
          </p>
        )}
      </div>
    </div>
  )
}

