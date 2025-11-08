import { Building, FileText, CheckCircle, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const statsCards = [
  {
    title: "Total Properties Monitored",
    value: "12,847",
    icon: Building,
    change: "+8% this month",
    changeType: "positive" as const,
  },
  {
    title: "Active Claims",
    value: "156",
    icon: FileText,
    change: "+23% this week",
    changeType: "negative" as const,
  },
  {
    title: "Auto-Approved Claims",
    value: "89",
    icon: CheckCircle,
    change: "57% of total",
    changeType: "neutral" as const,
  },
  {
    title: "Avg Processing Time",
    value: "2.3 days",
    icon: Clock,
    change: "-67% vs manual",
    changeType: "positive" as const,
  },
];

const highRiskProperties = [
  { address: "123 Ocean Drive, Miami, FL", risk: 87, riskLevel: "high" },
  { address: "456 Coastal Ave, Houston, TX", risk: 76, riskLevel: "high" },
  { address: "789 Beach Blvd, New Orleans, LA", risk: 71, riskLevel: "medium" },
  { address: "321 River Rd, Charleston, SC", risk: 68, riskLevel: "medium" },
  { address: "654 Bay St, Tampa, FL", risk: 64, riskLevel: "medium" },
];

const recentClaims = [
  { id: "CLM-4521", status: "Auto-approved", amount: "$47,500" },
  { id: "CLM-4522", status: "Pending", amount: "$32,100" },
  { id: "CLM-4523", status: "Auto-approved", amount: "$18,900" },
  { id: "CLM-4524", status: "Review", amount: "$89,400" },
  { id: "CLM-4525", status: "Auto-approved", amount: "$12,300" },
];

export default function Home() {
  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground">Welcome to AlphaEarth Insurance Portal</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {statsCards.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className="h-8 w-8 text-primary" />
              </div>
              <div className="space-y-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold">{stat.value}</p>
                <Badge
                  variant={
                    stat.changeType === "positive"
                      ? "default"
                      : stat.changeType === "negative"
                      ? "destructive"
                      : "secondary"
                  }
                  className="text-xs"
                >
                  {stat.change}
                </Badge>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Alert Banner */}
      <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-6 w-6 text-destructive flex-shrink-0 mt-1" />
          <div className="flex-1">
            <p className="font-medium">
              Hurricane Elena upgraded to Category 4 - 124 properties in projected path
            </p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="destructive">
              View Affected
            </Button>
            <Button size="sm" variant="outline">
              Send Alerts
            </Button>
          </div>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent High-Risk Properties */}
        <Card>
          <CardHeader>
            <CardTitle>Recent High-Risk Properties</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {highRiskProperties.map((property, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{property.address}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={
                        property.riskLevel === "high"
                          ? "destructive"
                          : property.riskLevel === "medium"
                          ? "secondary"
                          : "default"
                      }
                    >
                      {property.risk}% Risk
                    </Badge>
                    <Button size="sm" variant="outline">
                      View
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Claims */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Claims</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentClaims.map((claim, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                >
                  <div className="flex-1">
                    <p className="font-medium text-sm">{claim.id}</p>
                    <p className="text-xs text-muted-foreground">Amount: {claim.amount}</p>
                  </div>
                  <Badge
                    variant={
                      claim.status === "Auto-approved"
                        ? "default"
                        : claim.status === "Review"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {claim.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
