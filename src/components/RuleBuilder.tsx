
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Rule } from '@/types/data';
import { Zap, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface RuleBuilderProps {
  rules: Rule[];
  onAddRule: (rule: Rule) => void;
  onUpdateRule: (ruleId: string, updates: Partial<Rule>) => void;
  onDeleteRule: (ruleId: string) => void;
}

const RuleBuilder: React.FC<RuleBuilderProps> = ({
  rules,
  onAddRule,
  onUpdateRule,
  onDeleteRule
}) => {
  const [naturalLanguageInput, setNaturalLanguageInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const processNaturalLanguageRule = async () => {
    if (!naturalLanguageInput.trim()) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simple rule parsing logic (in real app, this would be AI-powered)
    const input = naturalLanguageInput.toLowerCase();
    let rule: Rule;
    
    if (input.includes('co-run') || input.includes('together') || input.includes('pair')) {
      rule = {
        id: Date.now().toString(),
        type: 'co-run',
        description: naturalLanguageInput,
        config: {
          taskIds: extractTaskIds(input)
        },
        enabled: true
      };
    } else if (input.includes('limit') && input.includes('group')) {
      rule = {
        id: Date.now().toString(),
        type: 'load-limit',
        description: naturalLanguageInput,
        config: {
          groupTag: extractGroupTag(input),
          maxTasks: extractNumber(input) || 3
        },
        enabled: true
      };
    } else if (input.includes('phase') && input.includes('only')) {
      rule = {
        id: Date.now().toString(),
        type: 'phase-window',
        description: naturalLanguageInput,
        config: {
          taskIds: extractTaskIds(input),
          allowedPhases: extractPhases(input)
        },
        enabled: true
      };
    } else {
      rule = {
        id: Date.now().toString(),
        type: 'co-run',
        description: naturalLanguageInput,
        config: { custom: true },
        enabled: true
      };
    }
    
    onAddRule(rule);
    setNaturalLanguageInput('');
    setIsProcessing(false);
    
    toast({
      title: "Rule created",
      description: "Successfully converted natural language to rule",
    });
  };

  const extractTaskIds = (input: string): string[] => {
    const matches = input.match(/t\d+/g) || [];
    return matches.map(match => match.toUpperCase());
  };

  const extractGroupTag = (input: string): string => {
    const match = input.match(/group\s+([a-zA-Z]+)/i);
    return match ? match[1] : 'unknown';
  };

  const extractNumber = (input: string): number | null => {
    const match = input.match(/\d+/);
    return match ? parseInt(match[0]) : null;
  };

  const extractPhases = (input: string): number[] => {
    const matches = input.match(/\d+/g) || [];
    return matches.map(match => parseInt(match));
  };

  const getRuleTypeColor = (type: string) => {
    switch (type) {
      case 'co-run': return 'bg-blue-500';
      case 'load-limit': return 'bg-orange-500';
      case 'phase-window': return 'bg-green-500';
      case 'slot-restriction': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <Card className="magic-card">
      <CardHeader>
        <CardTitle className="glow-text">Rule Builder</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium text-white mb-2 block">
              Natural Language Rule Input
            </label>
            <Textarea
              placeholder="e.g., 'Always run T1 and T3 together' or 'Limit Group Alpha to 2 tasks per phase'"
              value={naturalLanguageInput}
              onChange={(e) => setNaturalLanguageInput(e.target.value)}
              className="min-h-[80px]"
            />
          </div>
          <Button
            onClick={processNaturalLanguageRule}
            disabled={isProcessing || !naturalLanguageInput.trim()}
            className="magic-button w-full"
          >
            <Zap className="mr-2 h-4 w-4" />
            {isProcessing ? 'Processing...' : 'Convert to Rule'}
          </Button>
        </div>

        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-white">Active Rules</h3>
          {rules.length === 0 ? (
            <p className="text-gray-400 text-center py-8">
              No rules created yet. Try adding one above!
            </p>
          ) : (
            <div className="space-y-3">
              {rules.map(rule => (
                <div key={rule.id} className="border border-white/20 rounded-lg p-4 bg-card/30">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={`${getRuleTypeColor(rule.type)} text-white`}>
                          {rule.type}
                        </Badge>
                        <Switch
                          checked={rule.enabled}
                          onCheckedChange={(enabled) => onUpdateRule(rule.id, { enabled })}
                        />
                      </div>
                      <p className="text-sm text-gray-300">{rule.description}</p>
                      <pre className="text-xs text-gray-400 mt-2 bg-black/20 p-2 rounded">
                        {JSON.stringify(rule.config, null, 2)}
                      </pre>
                    </div>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => onDeleteRule(rule.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default RuleBuilder;
