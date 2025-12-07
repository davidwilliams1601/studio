"use client";


import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { ArrowLeft, CheckCircle } from 'lucide-react';

export default function GuidePage() {
  const steps = [
    {
      title: 'Sign in to LinkedIn',
      description: 'Navigate to LinkedIn.com and sign in to your account.',
    },
    {
      title: 'Go to Settings',
      description:
        'Click on your profile picture (the "Me" icon) in the top right corner, and select "Settings & Privacy" from the dropdown menu.',
    },
    {
      title: 'Navigate to Data Privacy',
      description:
        'On the left-hand sidebar, click on the "Data privacy" tab.',
    },
    {
      title: 'Request Your Data Archive',
      description:
        'Under the "How LinkedIn uses your data" section, find and click on "Get a copy of your data".',
    },
    {
      title: 'Select "The Works"',
      description:
        'You will be presented with a few options. To get a complete backup, select the option labeled "Want something in particular? Select the data you\'re most interested in." and then toggle the "The works" option. This will download everything.',
    },
    {
      title: 'Submit Your Request',
      description:
        'Click the "Request archive" button. LinkedIn will start preparing your data. This can take up to 24 hours.',
    },
    {
      title: 'Download Your Data',
      description:
        'You will receive an email from LinkedIn when your download is ready. Follow the link in the email to download a ZIP file containing all your data. This is the file you will upload to LinkStream.',
    },
  ];

  return (
    <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="icon" asChild>
          <Link href="/dashboard">
            <ArrowLeft className="h-4 w-4" />
            <span className="sr-only">Back to Dashboard</span>
          </Link>
        </Button>
        <h1 className="font-headline text-lg font-semibold md:text-2xl">
          How to Export Your LinkedIn Data
        </h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Step-by-Step Guide</CardTitle>
          <CardDescription>
            Follow these steps to download your data archive from LinkedIn.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
                  {index + 1}
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold">{step.title}</h3>
                  <p className="text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </main>
  );
}
