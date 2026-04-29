import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import type { Template } from '../types';
import { Card, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, ArrowRight } from 'lucide-react';

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({ template }: TemplateCardProps) {
  return (
    <Card className="hover:shadow-md transition-shadow cursor-pointer group shadow-sm">
      <Link to={`/templates/${template.id}`}>
        <CardHeader className="pb-2 pt-3 px-4">
          <CardTitle className="line-clamp-1 text-base">{template.name}</CardTitle>
          <CardDescription className="line-clamp-2 mt-1 min-h-[32px] text-xs">
            {template.system_prompt}
          </CardDescription>
        </CardHeader>
        <CardFooter className="flex justify-between items-center text-xs text-muted-foreground border-t pt-3 pb-3 px-4">
          <div className="flex items-center">
            <Calendar className="mr-1 h-3 w-3" />
            {format(new Date(template.created_at), 'MMM d, yyyy')}
          </div>
          <Button variant="ghost" size="sm" className="h-6 px-2 text-xs group-hover:translate-x-1 transition-transform">
            View <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </CardFooter>
      </Link>
    </Card>
  );
}
