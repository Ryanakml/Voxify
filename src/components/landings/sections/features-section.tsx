import { ChartSplineIcon, LayoutPanelTopIcon, NotebookPenIcon } from "lucide-react";

interface Feature {
  icon: React.FC<React.SVGProps<SVGSVGElement>>;
  title: string;
  description: string;
}

export default function FeaturesSection() {
  const features: Feature[] = [
    {
      icon: LayoutPanelTopIcon,
      title: "Voice Library",
      description:
        "Pick from expressive voices by tone, accent, and use case for consistent brand audio.",
    },
    {
      icon: NotebookPenIcon,
      title: "Script-to-Speech",
      description:
        "Paste your script, fine-tune delivery, and generate natural narration in seconds.",
    },
    {
      icon: ChartSplineIcon,
      title: "Production-Ready Exports",
      description:
        "Download clean audio outputs ready for ads, videos, courses, podcasts, and product demos.",
    },
  ];

  return (
    <div
      id="features"
      className="mt-42 mx-auto grid max-w-6xl grid-cols-1 divide-y divide-gray-200/70 rounded-lg border border-gray-200/70 lg:grid-cols-3 lg:divide-x lg:divide-y-0"
    >
      {features.map((item, index) => (
        <div
          key={index}
          className="flex flex-col items-start gap-4 p-8 pb-14 transition duration-300 hover:bg-gray-50"
        >
          <div className="flex items-center gap-2 text-gray-500">
            <item.icon className="size-5" />
            <h2 className="text-base font-medium">{item.title}</h2>
          </div>
          <p className="max-w-72 text-sm/6 text-gray-500">{item.description}</p>
        </div>
      ))}
    </div>
  );
}
