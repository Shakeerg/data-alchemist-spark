
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Upload } from 'lucide-react';

const LandingPage = () => {
  const [isDark, setIsDark] = useState(true);

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('light');
  };

  const features = [
    {
      emoji: '🔹',
      title: 'Smart Uploads',
      description: 'Drop your chaos here—we\'ll conjure structure.'
    },
    {
      emoji: '🔹',
      title: 'Live Editable Grids',
      description: 'Like a spreadsheet... if it had brains and sparkle.'
    },
    {
      emoji: '🔹',
      title: 'AI-Powered Validation',
      description: 'We sniff out the mess before it bites you. 🧼'
    },
    {
      emoji: '🔹',
      title: 'Natural Language Search',
      description: '"Show me tasks with duration > 2 in phase 3." — boom, results.'
    },
    {
      emoji: '🔹',
      title: 'Speak Rules, Get JSON',
      description: 'Say "T1 and T3", get clean logic. You speak, we whisper JSON.'
    },
    {
      emoji: '🔹',
      title: 'Prioritization Sliders',
      description: 'Want to optimize for speed? Fairness? Balance them all with elegant sliders or rankings.'
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      {/* Theme Toggle */}
      <div className="fixed top-6 right-6 z-50 flex items-center space-x-3 bg-card/80 backdrop-blur-sm rounded-full px-4 py-2 border border-white/10">
        <span className="text-sm text-muted-foreground">
          {isDark ? '🌙 Dark for night-owls' : '☀️ Light for mortals'}
        </span>
        <Switch checked={!isDark} onCheckedChange={toggleTheme} />
      </div>

      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="w-full h-full bg-repeat" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%236366f1' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='1'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`
          }}></div>
        </div>
        
        <div className="container mx-auto px-6 py-24 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="mb-8 animate-float">
              <span className="text-6xl">🧙‍♂️</span>
            </div>
            
            <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-white via-purple-200 to-yellow-200 bg-clip-text text-transparent leading-tight">
              ✨ Data Alchemist
            </h1>
            
            <p className="text-xl md:text-2xl mb-4 text-purple-200 font-medium">
              Turn spreadsheet chaos into gold.
            </p>
            
            <p className="text-lg md:text-xl mb-12 text-gray-300 max-w-3xl mx-auto leading-relaxed">
              Tame wild CSVs and Excel beasts with the power of AI. Clean, validate, and rule them all—with a wand 🪄 (or just plain English).
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
              <Button className="magic-button text-lg px-8 py-4 animate-glow">
                <Upload className="mr-2 h-5 w-5" />
                🔮 Begin the Magic
              </Button>
              
              <p className="text-purple-200 font-medium">
                You're not lost. You're exploring. 🪄
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6 glow-text">
            🪄 Magical Powers
          </h2>
          <p className="text-xl text-gray-300 max-w-2xl mx-auto">
            Transform chaos into clarity. One cell at a time.
          </p>
        </div>
        
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
          {features.map((feature, index) => (
            <Card key={index} className="magic-card group">
              <CardContent className="p-6">
                <div className="text-4xl mb-4 group-hover:animate-float">
                  {feature.emoji}
                </div>
                <h3 className="text-xl font-bold mb-3 text-white">
                  {feature.title}
                </h3>
                <p className="text-gray-300 leading-relaxed">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Export Section */}
      <div className="container mx-auto px-6 py-24">
        <Card className="magic-card max-w-4xl mx-auto text-center">
          <CardContent className="p-12">
            <div className="text-5xl mb-6">📤</div>
            <h3 className="text-3xl font-bold mb-4 glow-text">
              Export-Ready Output
            </h3>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              Download perfectly formatted data + rules.json for the next stage of your resource alchemy.
            </p>
            <Button className="magic-button">
              💛 Get Your Golden Data
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Bonus Features */}
      <div className="container mx-auto px-6 py-24">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold mb-6 glow-text">
            🔧 Lovable Dev Touches
          </h2>
          <p className="text-lg text-gray-300 mb-4">
            No code? No problem.
          </p>
          <p className="text-sm text-purple-200">
            Warning: May cause extreme clarity.
          </p>
        </div>
        
        <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="magic-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl mb-4">🌗</div>
              <h3 className="text-lg font-bold mb-2 text-white">Theme Toggle</h3>
              <p className="text-gray-300 text-sm">Light for mortals. Dark for night-owls.</p>
            </CardContent>
          </Card>
          
          <Card className="magic-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl mb-4">🐞</div>
              <h3 className="text-lg font-bold mb-2 text-white">Debug Mode</h3>
              <p className="text-gray-300 text-sm">Show me AI thoughts (for power users only 💥)</p>
            </CardContent>
          </Card>
          
          <Card className="magic-card text-center">
            <CardContent className="p-6">
              <div className="text-3xl mb-4">📁</div>
              <h3 className="text-lg font-bold mb-2 text-white">/Samples Folder</h3>
              <p className="text-gray-300 text-sm">Try your chaos... if you dare.</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer CTA */}
      <div className="container mx-auto px-6 py-24 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-4xl md:text-5xl font-bold mb-8 bg-gradient-to-r from-purple-400 to-yellow-400 bg-clip-text text-transparent">
            Ready to Transform Your Data?
          </h2>
          <p className="text-xl text-gray-300 mb-12">
            Join the data alchemists and turn your spreadsheet chaos into pure gold
          </p>
          <Button className="magic-button text-xl px-12 py-6">
            <Upload className="mr-3 h-6 w-6" />
            🔮 Begin the Magic
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
