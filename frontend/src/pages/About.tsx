import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Brain, LineChart, Sparkles, Users, Code2, Database } from 'lucide-react';
import { useI18n } from '../lib/i18n';

const TEAM = [
  { name: 'Mahmoud El-Sherbiny', role: { en: 'Developer', ar: 'مطوّر' } },
  { name: 'Mohamed Tamer', role: { en: 'Developer', ar: 'مطوّر' } },
  { name: 'Ahmed Raed', role: { en: 'Developer', ar: 'مطوّر' } },
  { name: 'Jana', role: { en: 'Developer', ar: 'مطوّرة' } },
];

const TECH = [
  { name: 'React + TypeScript', desc: { en: 'Frontend Framework', ar: 'إطار الواجهة الأمامية' }, icon: Code2 },
  { name: 'FastAPI (Python)', desc: { en: 'Backend API', ar: 'واجهة الخادم' }, icon: Database },
  { name: 'MLPClassifier', desc: { en: 'Neural Network for Categorization', ar: 'شبكة عصبية للتصنيف' }, icon: Brain },
  { name: 'PuLP (CBC Solver)', desc: { en: 'Linear Programming Optimizer', ar: 'محسّن البرمجة الخطية' }, icon: LineChart },
];

export default function About() {
  const { t, lang } = useI18n();

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Hero */}
      <div className="text-center space-y-4 py-6">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto">
          <Sparkles className="w-8 h-8 text-primary" />
        </div>
        <h2 className="text-3xl font-bold tracking-tight">{t('about.title')}</h2>
        <p className="text-muted-foreground text-lg max-w-xl mx-auto leading-relaxed">
          {t('about.desc')}
        </p>
      </div>

      <Separator />

      {/* How It Works */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('about.howItWorks')}</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Sparkles className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="font-semibold text-sm">{t('about.nlp')}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{t('about.nlpDesc')}</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <Brain className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h4 className="font-semibold text-sm">{t('about.nn')}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{t('about.nnDesc')}</p>
            </CardContent>
          </Card>

          <Card className="group hover:shadow-md transition-shadow">
            <CardContent className="pt-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mx-auto group-hover:scale-110 transition-transform">
                <LineChart className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <h4 className="font-semibold text-sm">{t('about.lp')}</h4>
              <p className="text-xs text-muted-foreground leading-relaxed">{t('about.lpDesc')}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      <Separator />

      {/* Tech Stack */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">{t('about.techStack')}</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {TECH.map((tech) => {
            const Icon = tech.icon;
            return (
              <Card key={tech.name} className="hover:shadow-sm transition-shadow">
                <CardContent className="flex items-center gap-4 py-4">
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                    <Icon className="w-5 h-5 text-muted-foreground" />
                  </div>
                  <div>
                    <p className="font-medium text-sm">{tech.name}</p>
                    <p className="text-xs text-muted-foreground">{tech.desc[lang]}</p>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>

      <Separator />

      {/* Team */}
      <div className="space-y-4 pb-8">
        <h3 className="text-lg font-semibold flex items-center gap-2">
          <Users className="w-5 h-5" />
          {t('about.createdBy')}
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {TEAM.map((member) => (
            <Card key={member.name} className="hover:shadow-sm transition-shadow">
              <CardContent className="pt-5 text-center space-y-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto text-primary font-bold text-lg">
                  {member.name.charAt(0)}
                </div>
                <p className="font-semibold text-sm">{member.name}</p>
                <Badge variant="secondary" className="text-[10px]">{member.role[lang]}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
