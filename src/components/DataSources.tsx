import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ExternalLink } from "lucide-react";

const dataSources = [
  {
    name: "Google Earth Engine",
    description: "Satellite imagery, land cover, flood maps, wildfire tracking",
    url: "https://earthengine.google.com/",
  },
  {
    name: "NASA Earth Data",
    description: "MODIS, Sentinel, Landsat global imagery for damage assessment",
    url: "https://earthdata.nasa.gov/",
  },
  {
    name: "NOAA Storm Events",
    description: "Historical hurricane, rainfall, and wind damage data",
    url: "https://www.ncei.noaa.gov/",
  },
  {
    name: "FEMA Flood Zones",
    description: "U.S. government flood risk maps and hazard zones",
    url: "https://msc.fema.gov/",
  },
];

export const DataSources = () => {
  return (
    <section className="py-20 px-4 bg-background">
      <div className="container mx-auto max-w-6xl">
        <div className="text-center space-y-4 mb-12">
          <Badge variant="outline" className="mb-4">Trusted Data Sources</Badge>
          <h2 className="text-4xl md:text-5xl font-bold text-foreground">
            Powered by Leading Earth Observation Platforms
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Our AI integrates data from the most trusted government and scientific organizations worldwide.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {dataSources.map((source, index) => (
            <Card key={index} className="p-6 border-2 hover:border-primary/30 transition-colors group">
              <div className="flex items-start justify-between">
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                    {source.name}
                  </h3>
                  <p className="text-muted-foreground">{source.description}</p>
                </div>
                <a
                  href={source.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
};
