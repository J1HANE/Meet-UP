import { getSeverityStyles } from "@/lib/utils";
import { AiInsight } from "@/types/ai-service";
import { useState } from "react";

interface InsightCardProps {
  insight: AiInsight;
}

const InsightCard = ({ insight }: InsightCardProps) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className='group glass-panel rounded-xl transition-all duration-300 hover:glow-border hover:scale-[1.01]'>
      <div className='p-6'>
        <div className='flex items-start justify-between gap-4'>
          <div className='flex-1 space-y-3'>
            {/* Severity and Category Badges */}
            <div className='flex items-center gap-2 flex-wrap'>
              <div className='flex items-center gap-2'>
                <span className='neon-dot' />
                <span
                  className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${getSeverityStyles(
                    insight.severity,
                  )}`}
                >
                  {insight.severity}
                </span>
              </div>
              <span className='inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-secondary text-secondary-foreground border border-border'>
                {insight.category.replace(/_/g, " ")}
              </span>
            </div>

            {/* Title */}
            <h3 className='text-lg font-heading font-semibold text-foreground leading-tight'>
              {insight.title}
            </h3>

            {/* Detail */}
            <p className='text-sm text-muted-foreground leading-relaxed'>
              {insight.detail}
            </p>

            {/* Affected Entities */}
            {insight.affectedEntities.length > 0 && (
              <div className='space-y-1.5'>
                <h4 className='text-xs font-semibold text-muted-foreground uppercase tracking-wider'>
                  Affected Entities
                </h4>
                <div className='flex flex-wrap gap-2'>
                  {insight.affectedEntities.map((entity) => (
                    <span
                      key={entity}
                      className='inline-flex items-center px-2 py-0.5 rounded text-xs font-mono bg-surface text-surface-foreground border border-border'
                    >
                      {entity}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendation Toggle Button */}
            <button
              onClick={() => setExpanded(!expanded)}
              className='text-sm font-medium text-primary hover:text-primary/80 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-primary/50 rounded-lg'
            >
              {expanded ? "Hide recommendation" : "Show recommendation"}
              <span className='ml-1 inline-block transition-transform duration-200'>
                {expanded ? "↑" : "↓"}
              </span>
            </button>

            {/* Recommendation Content */}
            {expanded && (
              <div className='mt-3 p-4 rounded-lg bg-gradient-surface border border-primary/20 animate-in slide-in-from-top-2 duration-200'>
                <div className='flex gap-2'>
                  <div className='w-0.5 bg-primary rounded-full' />
                  <div className='flex-1'>
                    <h4 className='text-sm font-semibold text-primary mb-1'>
                      Recommendation
                    </h4>
                    <p className='text-sm text-foreground/80 leading-relaxed'>
                      {insight.recommendation}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
export default InsightCard;
