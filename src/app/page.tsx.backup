import Link from 'next/link';
import {
  ArrowRight,
  Check,
  BrainCircuit,
  UploadCloud,
  LayoutDashboard,
  ShieldCheck,
  AlertTriangle,
  Database,
  Sparkles,
  HardDrive,
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
            Your LinkedIn data. Secured and Analyzed.
          </h1>
          <p className="mx-auto mt-6 max-w-[700px] text-lg text-muted-foreground md:text-xl">
            Stop worrying about losing your account. LinkStream creates a secure, living backup of your LinkedIn data and uses AI to reveal powerful insights for your career growth.
          </p>
          <div className="mt-8 flex gap-4">
            <Button asChild size="lg">
              <Link href="/signup">
                Secure Your Network Now <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </section>

        <section id="security" className="bg-secondary">
          <div className="container grid items-center gap-8 py-24 md:grid-cols-2 lg:py-32">
              <div className="space-y-4">
                  <div className="inline-block rounded-lg bg-primary/10 px-3 py-1 text-sm font-bold text-primary">
                      A Growing Threat
                  </div>
                  <h2 className="font-headline text-3xl font-bold tracking-tighter sm:text-4xl">Your Digital Reputation is Under Constant Attack</h2>
                  <p className="text-muted-foreground md:text-lg">
                      In 2021, data from over 93% of all LinkedIn users was scraped by hackers. With social media account takeovers increasing by 1,000% in the last two years, your professional identity is a valuable target. Losing your profile means losing connections, conversations, and credibility. Don't wait for disaster. LinkStream provides the ultimate insurance policy for your professional identity.
                  </p>
              </div>
               <div className="flex items-center justify-center">
                  <AlertTriangle className="h-32 w-32 text-primary/50" />
              </div>
          </div>
        </section>

        <section className="container py-24">
            <div className="mx-auto flex max-w-2xl flex-col items-center space-y-4 text-center">
                <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
                    More Than a Backup. A Strategic Advantage.
                </h2>
                <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
                    A local file on your hard drive is static. LinkStream brings your data to life.
                </p>
            </div>
            <div className="mt-12 grid gap-8 md:grid-cols-2">
                <Card className="p-6">
                    <div className="flex items-center gap-4">
                        <div className="rounded-full bg-muted p-3">
                           <HardDrive className="h-8 w-8 text-muted-foreground" />
                        </div>
                        <h3 className="font-headline text-2xl font-bold">Local Backup</h3>
                    </div>
                    <ul className="mt-6 space-y-3 text-muted-foreground">
                        <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 shrink-0 text-destructive/50" /><div>A single, static file</div></li>
                        <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 shrink-0 text-destructive/50" /><div>No insights or analysis</div></li>
                        <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 shrink-0 text-destructive/50" /><div>Difficult to search or use</div></li>
                         <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 shrink-0 text-destructive/50" /><div>Requires manual, regular downloads</div></li>
                    </ul>
                </Card>
                <Card className="border-2 border-primary p-6">
                     <div className="flex items-center gap-4">
                        <div className="rounded-full bg-primary/10 p-3">
                           <Logo />
                        </div>
                        <h3 className="font-headline text-2xl font-bold">LinkStream</h3>
                    </div>
                     <ul className="mt-6 space-y-3 text-foreground">
                        <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 shrink-0 text-accent" /><div>A secure, living vault of your data</div></li>
                        <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 shrink-0 text-accent" /><div>AI-powered insights and trends</div></li>
                        <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 shrink-0 text-accent" /><div>Personalized dashboard to track growth</div></li>
                        <li className="flex items-start gap-3"><Check className="h-5 w-5 mt-0.5 shrink-0 text-accent" /><div>AI content generation to boost engagement</div></li>
                    </ul>
                </Card>
            </div>
        </section>


        <section id="features" className="container space-y-12 py-8 md:py-12 lg:py-24">
          <div className="mx-auto flex max-w-[58rem] flex-col items-center space-y-4 text-center">
            <h2 className="font-headline text-3xl font-bold leading-[1.1] sm:text-3xl md:text-5xl">
              How It Works
            </h2>
            <p className="max-w-[85%] leading-normal text-muted-foreground sm:text-lg sm:leading-7">
              Turn your raw LinkedIn data into your greatest professional asset in three simple steps.
            </p>
          </div>
          <div className="mx-auto grid justify-center gap-8 sm:grid-cols-2 md:max-w-[64rem] lg:grid-cols-3">
            <div className="relative overflow-hidden rounded-lg border bg-card p-2">
              <div className="flex h-full flex-col justify-between rounded-md p-6">
                <div className="mb-4">
                    <UploadCloud className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">1. Upload Your Archive</h3>
                  <p className="text-sm text-muted-foreground">
                    Securely upload your LinkedIn ZIP export with our simple drag-and-drop interface.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2">
              <div className="flex h-full flex-col justify-between rounded-md p-6">
                 <div className="mb-4">
                    <BrainCircuit className="h-12 w-12 text-primary" />
                 </div>
                <div className="space-y-2">
                  <h3 className="font-bold">2. Get AI-Powered Insights</h3>
                  <p className="text-sm text-muted-foreground">
                    Our AI analyzes your activity to find key trends, highlight important connections, and summarize your professional journey.
                  </p>
                </div>
              </div>
            </div>
            <div className="relative overflow-hidden rounded-lg border bg-card p-2">
              <div className="flex h-full flex-col justify-between rounded-md p-6">
                <div className="mb-4">
                    <LayoutDashboard className="h-12 w-12 text-primary" />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold">3. Grow Your Network</h3>
                  <p className="text-sm text-muted-foreground">
                    Use your personalized dashboard and content ideas to engage your audience and build your brand.
                  </p>
                </div>
              </div>
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
          <nav className="flex gap-4">
            <Link
                href="/faq"
                className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
                FAQ
            </Link>
          </nav>
          <p className="text-center text-sm md:text-left">© {new Date().getFullYear()} LinkStream. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
