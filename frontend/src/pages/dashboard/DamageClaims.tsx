import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { ChevronLeft, ChevronRight, FileText, Phone, Mail } from "lucide-react";

export default function DamageClaims() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Automated Damage Claims</h1>
          <p className="text-muted-foreground">Hurricane Elena - Oct 15, 2024</p>
          <p className="text-sm text-muted-foreground">
            124 properties affected | $8.2M estimated damage
          </p>
        </div>
      </div>

      {/* Property Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <p className="text-sm text-muted-foreground">Property ID</p>
              <p className="font-bold text-lg">#4521</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Address</p>
              <p className="font-medium">123 Ocean Drive, Miami Beach, FL</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Policyholder</p>
              <p className="font-medium">John Mitchell</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Insured Value</p>
              <p className="font-bold">$450,000</p>
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Policy Number</p>
              <p className="font-medium">INS-2024-45891</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Before/After Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Before */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 Before Hurricane (Oct 1, 2024)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 rounded-lg bg-gradient-to-br from-green-200 to-green-500 flex items-center justify-center">
              <p className="text-white font-medium">Satellite Image - Property Intact</p>
            </div>
            <p className="text-sm flex items-center gap-2">
              <span className="text-green-600">✓</span> Property intact
            </p>
            <Button variant="outline" className="w-full">
              View Full Resolution
            </Button>
          </CardContent>
        </Card>

        {/* After */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              📅 After Hurricane (Oct 15, 2024)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="h-64 rounded-lg bg-gradient-to-br from-red-600 to-red-900 flex items-center justify-center">
              <p className="text-white font-medium">Satellite Image - Damage Detected</p>
            </div>
            <p className="text-sm flex items-center gap-2">
              <span className="text-red-600">⚠️</span> Damage detected
            </p>
            <Button variant="outline" className="w-full">
              View Full Resolution
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* AI Analysis Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🤖 AI Damage Assessment
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Confidence Score</span>
              <span className="text-sm font-bold">87%</span>
            </div>
            <Progress value={87} className="h-3" />
          </div>

          <div>
            <p className="font-medium mb-3">Detected Issues:</p>
            <ul className="space-y-2">
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-sm">Roof structural damage (Coverage area: 45%)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-sm">Water infiltration (Depth: moderate)</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600 mt-0.5">✓</span>
                <span className="text-sm">Exterior wall damage (North side)</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t">
            <p className="text-2xl font-bold text-primary">
              Estimated Damage Cost: $47,500
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Claim Status Card */}
      <Card className="border-green-500 bg-green-50">
        <CardContent className="p-6 space-y-4">
          <Badge className="bg-green-600 text-white text-lg px-4 py-2">
            🟢 AUTO-APPROVED
          </Badge>
          <div className="space-y-2">
            <p className="text-xl font-bold">Payout Amount: $47,500</p>
            <p className="text-sm text-muted-foreground">
              Processing Time: 2 minutes (vs typical 14 days)
            </p>
          </div>
          <div className="flex gap-3 pt-2">
            <Button>
              <FileText className="h-4 w-4 mr-2" />
              Generate Report
            </Button>
            <Button variant="outline">
              <Mail className="h-4 w-4 mr-2" />
              Notify Client
            </Button>
            <Button variant="outline">
              <Phone className="h-4 w-4 mr-2" />
              Call Client
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t pt-4">
        <Button variant="outline">
          <ChevronLeft className="h-4 w-4 mr-2" />
          Previous Property
        </Button>
        <span className="text-sm text-muted-foreground">Property 1 of 124</span>
        <Button variant="outline">
          Next Property
          <ChevronRight className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
}
