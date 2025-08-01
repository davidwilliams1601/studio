import Link from 'next/link';
import {
  ArrowRight,
  Check,
  BrainCircuit,
  UploadCloud,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Logo } from '@/components/logo';

export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="container z-40 bg-background">
        <div className="flex h-20 items-center justify-between py-6">
          <Logo />
          <nav className="hidden gap-6 md:flex">
            <Link
              href="/login"
              className="flex items-center text-lg font-medium text-muted-foreground transition-colors hover:text-foreground sm:text-sm"
            >
              Login
            </Link>
            <Button asChild>
              <Link href="/signup">
                Sign Up <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </nav>
        </div>
      </header>
      <main className="flex-1">
        <section className="container flex flex-col items-center py-24 text-center sm:py-32">
          <h1 className="font-headline text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl">
            Unlock Your LinkedIn Potential
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
            LinkStream uses AI to analyze your LinkedIn data, revealing powerful
            insights to grow your professional network and career. Never lose your data to a hack again.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild size="lg">
              <Link href="/signup">
                Get Started for Free <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="features" className="container space-y-12 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Features
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Everything you need to turn your LinkedIn data into a strategic asset.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] lg:grid-cols-4">
            <div className="relative overflow-hidden rounded-lg border bg-card p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <UploadCloud className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Easy Data Upload</h3>
                  <p className="text-sm text-muted-foreground">
                    Securely upload your LinkedIn ZIP export with a simple drag-and-drop interface.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <BrainCircuit className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">AI-Powered Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Our GenAI model extracts key insights from your connections, messages, and posts.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <LayoutDashboard className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Personalized Dashboard</h3>
                  <p className="text-sm text-muted-foreground">
                    Visualize your professional growth with key metrics and activity summaries.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2">
              <div className="flex h-[180px] flex-col justify-between rounded-md p-6">
                <ShieldCheck className="h-12 w-12 text-primary" />
                <div className="space-y-2">
                  <h3 className="font-bold">Backup & Secure Your Data</h3>
                  <p className="text-sm text-muted-foreground">
                    We provide a secure backup of your LinkedIn data, so you never lose your connections and content.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <section id="security" className="bg-secondary">
          <div className="container grid items-center gap-8 py-24 md:grid-cols-2 lg:py-32">
              <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm text-primary">
                      Peace of Mind
                  </div>
                  <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Don't Let a Hack Erase Your Hard Work</h2>
                  <p className="text-muted-foreground md:text-lg">
                      Losing your LinkedIn account to a hacker is devastating. Years of building connections, sharing content, and establishing your professional brand can vanish in an instant. LinkStream was born from this exact experience. We provide a secure, independent backup of your most valuable professional data, ensuring that if the worst happens, you're not left with nothing.
                  </p>
              </div>
               <div className="flex items-center justify-center">
                  <AlertTriangle className="h-32 w-32 text-primary/50" />
              </div>
          </div>
        </section>

        <section id="pricing" className="container py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              Pricing
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Choose the plan that fits your professional journey.
            </p>
          </div>
          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <Card>
              <CardHeader>
                <CardTitle>Free</CardTitle>
                <CardDescription>For casual users getting started</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">£0</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />1 backup per month</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />Basic AI summary</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />Dashboard access</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/signup">Get Started</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card className="border-primary shadow-lg">
              <CardHeader>
                <CardTitle>Pro</CardTitle>
                <CardDescription>For professionals and creators</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">£8</span>
                  <span className="ml-1 text-muted-foreground">/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />Weekly backups</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />Detailed AI insights</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />Download raw data</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />Priority support</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant="default" asChild>
                  <Link href="/signup">Choose Pro</Link>
                </Button>
              </CardFooter>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle>Business</CardTitle>
                <CardDescription>For power users and teams</CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold">£15</span>
                  <span className="ml-1 text-muted-foreground">/seat/month</span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />Unlimited backups</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />Advanced AI analysis tools</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />API access (coming soon)</li>
                  <li className="flex items-center"><Check className="mr-2 h-4 w-4 text-accent" />Team features</li>
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" asChild>
                  <Link href="/signup">Choose Business</Link>
                </Button>
              </CardFooter>
            </Card>
          </div>
        </section>
      </main>
      <footer className="container">
        <div className="flex flex-col items-center justify-between gap-4 border-t py-10 md:h-24 md:flex-row md:py-0">
          <div className="flex flex-col items-center gap-4 px-8 md:flex-row md:gap-2 md:px-0">
            <Logo />
            <p className="text-center text-sm leading-loose md:text-left">
              Built by Firebase Studio.
            </p>
          </div>
          <p className="text-center text-sm md:text-left">© {new Date().getFullYear()} LinkStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
