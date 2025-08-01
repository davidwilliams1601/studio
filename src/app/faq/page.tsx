
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Link from 'next/link';
  

const faqItems = [
    {
        question: 'How do I export my data from LinkedIn?',
        answer: (
            <>
              We have a detailed, step-by-step guide on how to export your data. You can find it on the{' '}
              <Link href="/dashboard/guide" className="text-primary underline">
                Export Guide
              </Link>{' '}
              page. It typically takes LinkedIn up to 24 hours to prepare your data archive for download.
            </>
        ),
    },
    {
        question: 'Is my LinkedIn data secure?',
        answer: 'Yes, absolutely. Your data is uploaded directly to your own secure cloud storage via our application. It is only accessed for the purpose of analysis, which happens on secure servers. We do not share your data with any third parties.'
    },
    {
        question: 'What format does the uploaded file need to be in?',
        answer: 'You must upload the ZIP file that you download directly from LinkedIn. Our system is designed to process this specific file format. Please do not unzip the file or alter its contents before uploading.'
    },
    {
        question: 'How often should I back up my data?',
        answer: 'This depends on your plan. The Free plan allows for monthly backups, while the Pro plan offers weekly backups. For the most up-to-date record of your professional network, we recommend backing up as frequently as your plan allows.'
    },
    {
        question: 'Can I cancel my subscription at any time?',
        answer: 'Yes, you can manage your subscription, including cancellations and plan changes, at any time from the settings page. Navigate to Settings and click on "Manage Subscription" to be redirected to our secure billing portal.'
    },
    {
        question: 'What happens to my data if I cancel my subscription?',
        answer: 'If you cancel your subscription, you will still have access to your dashboard and existing backups until the end of your billing period. You also have the option to permanently delete all of your data from our servers from the settings page.'
    },
];
  
export default function FaqPage() {
    return (
        <main className="flex flex-1 flex-col gap-4 p-4 md:gap-8 md:p-8">
            <div className="flex items-center">
                <h1 className="font-headline text-lg font-semibold md:text-2xl">
                    Frequently Asked Questions
                </h1>
            </div>
            <Card>
                <CardHeader>
                    <CardTitle>Common Questions</CardTitle>
                    <CardDescription>
                        Find answers to the most common questions about LinkStream.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Accordion type="single" collapsible className="w-full">
                        {faqItems.map((item, index) => (
                            <AccordionItem key={index} value={`item-${index}`}>
                                <AccordionTrigger>{item.question}</AccordionTrigger>
                                <AccordionContent className="prose prose-sm max-w-none text-muted-foreground">
                                    {item.answer}
                                </AccordionContent>
                            </AccordionItem>
                        ))}
                    </Accordion>
                </CardContent>
            </Card>
        </main>
    )
}
