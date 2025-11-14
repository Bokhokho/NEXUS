import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HelpCircle, Mail, Book, MessageCircle } from "lucide-react";

export default function SupportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Support Center</h1>
        <p className="text-muted-foreground">
          Get help and learn more about Sorcerer
        </p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Book className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Documentation</CardTitle>
                <CardDescription>
                  Learn how to use Sorcerer
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Comprehensive guides and tutorials to help you get the most out of
              the platform.
            </p>
            <Button variant="outline" className="w-full">
              View Documentation
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <MessageCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Live Chat</CardTitle>
                <CardDescription>
                  Chat with our support team
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Get instant help from our support team during business hours.
            </p>
            <Button variant="outline" className="w-full">
              Start Chat
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <Mail className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>Email Support</CardTitle>
                <CardDescription>
                  Send us a message
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Email our support team and we&apos;ll get back to you within 24 hours.
            </p>
            <Button variant="outline" className="w-full">
              Send Email
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/20">
                <HelpCircle className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>FAQ</CardTitle>
                <CardDescription>
                  Frequently asked questions
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              Find quick answers to common questions about the platform.
            </p>
            <Button variant="outline" className="w-full">
              View FAQ
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Links</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-2">
            <Button variant="ghost" className="justify-start">
              How to import contractors
            </Button>
            <Button variant="ghost" className="justify-start">
              Managing team members
            </Button>
            <Button variant="ghost" className="justify-start">
              Understanding contractor status
            </Button>
            <Button variant="ghost" className="justify-start">
              Generating reports
            </Button>
            <Button variant="ghost" className="justify-start">
              API integration guide
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
