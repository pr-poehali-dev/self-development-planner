import { useState, useEffect } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

const motivationalQuotes = [
  "Неважно пожрать в чось, прокрунте опрасе імети.",
  "FOCUS. Только действия приводят к результату.",
  "YOU VS YOU. Соревнуйся только с собой вчерашним.",
  "OBSESSION BEATS TALENT. Одержимость побеждает талант.",
];

interface Goal {
  id: number;
  title: string;
  category: string;
  progress: number;
  completed: boolean;
}

interface Task {
  id: number;
  title: string;
  time: string;
  completed: boolean;
}

const API_URL = 'https://functions.poehali.dev/75b8a5ae-57c5-4291-95af-374b5ecc07a9';

const Index = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [currentQuote] = useState(motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [dailyTasks, setDailyTasks] = useState<Task[]>([]);
  const [newGoalTitle, setNewGoalTitle] = useState('');
  const [newGoalCategory, setNewGoalCategory] = useState('goals');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskTime, setNewTaskTime] = useState('12:00');
  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isTaskDialogOpen, setIsTaskDialogOpen] = useState(false);
  const { toast } = useToast();

  const categories = [
    { id: 'study', name: 'Учеба', icon: 'BookOpen', color: 'from-blue-500 to-blue-700' },
    { id: 'health', name: 'Здоровье', icon: 'Heart', color: 'from-green-500 to-green-700' },
    { id: 'appearance', name: 'Внешность', icon: 'Sparkles', color: 'from-purple-500 to-purple-700' },
    { id: 'progress', name: 'Прогресс', icon: 'TrendingUp', color: 'from-orange-500 to-orange-700' },
    { id: 'goals', name: 'Цели', icon: 'Target', color: 'from-red-500 to-red-700' },
    { id: 'planner', name: 'Планировщик', icon: 'Calendar', color: 'from-indigo-500 to-indigo-700' },
  ];

  const loadGoals = async () => {
    try {
      const response = await fetch(`${API_URL}?endpoint=goals`);
      const data = await response.json();
      setGoals(data.goals);
    } catch (error) {
      console.error('Failed to load goals:', error);
    }
  };

  const loadTasks = async () => {
    try {
      const response = await fetch(`${API_URL}?endpoint=tasks`);
      const data = await response.json();
      setDailyTasks(data.tasks);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  };

  useEffect(() => {
    loadGoals();
    loadTasks();
  }, []);

  const overallProgress = goals.length > 0 
    ? Math.round(goals.reduce((acc, goal) => acc + goal.progress, 0) / goals.length)
    : 0;

  const toggleTask = async (id: number) => {
    const task = dailyTasks.find(t => t.id === id);
    if (!task) return;

    const newCompleted = !task.completed;
    setDailyTasks(tasks => 
      tasks.map(t => t.id === id ? { ...t, completed: newCompleted } : t)
    );

    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'task',
          id,
          completed: newCompleted
        })
      });
    } catch (error) {
      console.error('Failed to update task:', error);
      setDailyTasks(tasks => 
        tasks.map(t => t.id === id ? { ...t, completed: !newCompleted } : t)
      );
    }
  };

  const toggleGoal = async (id: number) => {
    const goal = goals.find(g => g.id === id);
    if (!goal) return;

    const newCompleted = !goal.completed;
    setGoals(goals => 
      goals.map(g => g.id === id ? { ...g, completed: newCompleted } : g)
    );

    try {
      await fetch(API_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'goal',
          id,
          completed: newCompleted
        })
      });
    } catch (error) {
      console.error('Failed to update goal:', error);
      setGoals(goals => 
        goals.map(g => g.id === id ? { ...g, completed: !newCompleted } : g)
      );
    }
  };

  const addGoal = async () => {
    if (!newGoalTitle.trim()) {
      toast({ title: 'Введите название цели', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_goal',
          title: newGoalTitle,
          category: newGoalCategory
        })
      });
      
      if (response.ok) {
        toast({ title: 'Цель добавлена!' });
        setNewGoalTitle('');
        setIsGoalDialogOpen(false);
        loadGoals();
      }
    } catch (error) {
      console.error('Failed to add goal:', error);
      toast({ title: 'Ошибка при добавлении цели', variant: 'destructive' });
    }
  };

  const addTask = async () => {
    if (!newTaskTitle.trim()) {
      toast({ title: 'Введите название задачи', variant: 'destructive' });
      return;
    }

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_task',
          title: newTaskTitle,
          time: newTaskTime
        })
      });
      
      if (response.ok) {
        toast({ title: 'Задача добавлена!' });
        setNewTaskTitle('');
        setNewTaskTime('12:00');
        setIsTaskDialogOpen(false);
        loadTasks();
      }
    } catch (error) {
      console.error('Failed to add task:', error);
      toast({ title: 'Ошибка при добавлении задачи', variant: 'destructive' });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1a1625] via-[#221c35] to-[#2d2440] relative">
      <div 
        className="absolute inset-0 opacity-10 bg-center bg-cover bg-no-repeat"
        style={{ backgroundImage: 'url(https://cdn.poehali.dev/files/278f34af-d640-4639-9281-2110f21e2f33.jpeg)' }}
      />
      <div className="relative z-10 container mx-auto px-4 py-8 max-w-7xl">
        <header className="mb-12 text-center animate-fade-in">
          <h1 className="text-6xl font-extrabold mb-4 bg-gradient-to-r from-primary via-purple-400 to-primary bg-clip-text text-transparent">
            МАСТИКА
          </h1>
          <p className="text-xl text-muted-foreground mb-6">Планируй. Развивайся. Достигай.</p>
          
          <Card className="bg-gradient-to-br from-card/60 to-card/40 border-primary/20 backdrop-blur-sm p-6 mb-8">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <Icon name="Quote" size={32} className="text-primary" />
                <p className="text-lg italic text-foreground/90">{currentQuote}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Общий прогресс</span>
                <span className="font-bold text-primary">{overallProgress}%</span>
              </div>
              <Progress value={overallProgress} className="h-3" />
            </div>
          </Card>
        </header>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12 animate-fade-in">
          {categories.map((category, index) => (
            <Card
              key={category.id}
              onClick={() => setActiveTab(category.id)}
              className={`cursor-pointer transition-all duration-300 hover:scale-105 hover-scale ${
                activeTab === category.id ? 'ring-2 ring-primary' : ''
              }`}
              style={{ animationDelay: `${index * 0.1}s` }}
            >
              <div className={`bg-gradient-to-br ${category.color} p-6 rounded-lg`}>
                <div className="flex flex-col items-center text-white">
                  <Icon name={category.icon} size={32} className="mb-2" />
                  <span className="text-sm font-semibold text-center">{category.name}</span>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="animate-fade-in">
          <TabsContent value="overview" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <Card className="p-6 bg-card/60 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="Target" className="text-primary" size={28} />
                  <h3 className="text-2xl font-bold">Активные цели</h3>
                </div>
                <div className="space-y-4">
                  {goals.slice(0, 4).map((goal) => (
                    <div key={goal.id} className="space-y-2">
                      <div className="flex justify-between items-center">
                        <span className="text-sm font-medium">{goal.title}</span>
                        <span className="text-xs text-primary font-bold">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </div>
                  ))}
                </div>
              </Card>

              <Card className="p-6 bg-card/60 backdrop-blur-sm border-primary/20">
                <div className="flex items-center gap-3 mb-4">
                  <Icon name="CalendarDays" className="text-accent" size={28} />
                  <h3 className="text-2xl font-bold">Сегодня</h3>
                </div>
                <div className="space-y-3">
                  {dailyTasks.map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center gap-3 p-3 rounded-lg bg-muted/20 hover:bg-muted/40 transition-colors"
                    >
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                      />
                      <div className="flex-1">
                        <p className={`font-medium ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-xs text-muted-foreground">{task.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="study" className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-blue-500/10 to-blue-700/10 border-blue-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-blue-500/20 rounded-xl">
                  <Icon name="BookOpen" className="text-blue-400" size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Учеба</h2>
                  <p className="text-muted-foreground">Развивай свои знания каждый день</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card/60 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Курсов завершено</p>
                  <p className="text-3xl font-bold text-blue-400">12</p>
                </div>
                <div className="bg-card/60 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Книг прочитано</p>
                  <p className="text-3xl font-bold text-blue-400">28</p>
                </div>
                <div className="bg-card/60 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Часов обучения</p>
                  <p className="text-3xl font-bold text-blue-400">156</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="health" className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-green-500/10 to-green-700/10 border-green-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-green-500/20 rounded-xl">
                  <Icon name="Heart" className="text-green-400" size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Здоровье</h2>
                  <p className="text-muted-foreground">Твоё тело — твой храм</p>
                </div>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                <div className="bg-card/60 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Тренировок</p>
                  <p className="text-3xl font-bold text-green-400">64</p>
                </div>
                <div className="bg-card/60 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Калории сожжено</p>
                  <p className="text-3xl font-bold text-green-400">18.4k</p>
                </div>
                <div className="bg-card/60 p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">Средний сон</p>
                  <p className="text-3xl font-bold text-green-400">7.5ч</p>
                </div>
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="appearance" className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-purple-500/10 to-purple-700/10 border-purple-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-purple-500/20 rounded-xl">
                  <Icon name="Sparkles" className="text-purple-400" size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Внешность</h2>
                  <p className="text-muted-foreground">Инвестируй в себя</p>
                </div>
              </div>
              <div className="space-y-4">
                {['Утренний уход за кожей', 'Вечерний уход за кожей', 'Уход за волосами', 'Маникюр'].map((item, i) => (
                  <div key={i} className="flex items-center gap-3 p-4 bg-card/60 rounded-lg">
                    <Checkbox />
                    <span>{item}</span>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-orange-500/10 to-orange-700/10 border-orange-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-orange-500/20 rounded-xl">
                  <Icon name="TrendingUp" className="text-orange-400" size={40} />
                </div>
                <div>
                  <h2 className="text-3xl font-bold">Прогресс</h2>
                  <p className="text-muted-foreground">Следи за своим ростом</p>
                </div>
              </div>
              <div className="space-y-6">
                {goals.map((goal) => {
                  const category = categories.find(c => c.id === goal.category);
                  return (
                    <Card key={goal.id} className="p-6 bg-card/40 border-primary/10">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <Icon name={category?.icon || 'Target'} className="text-primary" size={24} />
                          <div>
                            <h4 className="font-semibold">{goal.title}</h4>
                            <p className="text-xs text-muted-foreground">{category?.name}</p>
                          </div>
                        </div>
                        <span className="text-2xl font-bold text-primary">{goal.progress}%</span>
                      </div>
                      <Progress value={goal.progress} className="h-2" />
                    </Card>
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="goals" className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-red-500/10 to-red-700/10 border-red-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-red-500/20 rounded-xl">
                  <Icon name="Target" className="text-red-400" size={40} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold">Цели</h2>
                  <p className="text-muted-foreground">Достигай невозможного</p>
                </div>
                <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Icon name="Plus" size={20} className="mr-2" />
                      Добавить цель
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новая цель</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Название цели</label>
                        <Input 
                          value={newGoalTitle}
                          onChange={(e) => setNewGoalTitle(e.target.value)}
                          placeholder="Например: Изучить React"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Категория</label>
                        <Select value={newGoalCategory} onValueChange={setNewGoalCategory}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {categories.map(cat => (
                              <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      <Button onClick={addGoal} className="w-full">Добавить</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="space-y-4">
                {goals.map((goal) => (
                  <Card key={goal.id} className="p-5 bg-card/40 border-primary/10 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={goal.completed}
                        onCheckedChange={() => toggleGoal(goal.id)}
                        className="h-6 w-6"
                      />
                      <div className="flex-1">
                        <h4 className={`font-semibold text-lg ${goal.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {goal.title}
                        </h4>
                        <Progress value={goal.progress} className="h-2 mt-2" />
                      </div>
                      <span className="text-sm font-bold text-primary">{goal.progress}%</span>
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="planner" className="space-y-6">
            <Card className="p-8 bg-gradient-to-br from-indigo-500/10 to-indigo-700/10 border-indigo-500/20">
              <div className="flex items-center gap-4 mb-6">
                <div className="p-4 bg-indigo-500/20 rounded-xl">
                  <Icon name="Calendar" className="text-indigo-400" size={40} />
                </div>
                <div className="flex-1">
                  <h2 className="text-3xl font-bold">Планировщик</h2>
                  <p className="text-muted-foreground">Организуй свой день</p>
                </div>
                <Dialog open={isTaskDialogOpen} onOpenChange={setIsTaskDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-primary hover:bg-primary/90">
                      <Icon name="Plus" size={20} className="mr-2" />
                      Добавить задачу
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Новая задача</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Название задачи</label>
                        <Input 
                          value={newTaskTitle}
                          onChange={(e) => setNewTaskTitle(e.target.value)}
                          placeholder="Например: Позвонить клиенту"
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Время</label>
                        <Input 
                          type="time"
                          value={newTaskTime}
                          onChange={(e) => setNewTaskTime(e.target.value)}
                        />
                      </div>
                      <Button onClick={addTask} className="w-full">Добавить</Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                {dailyTasks.map((task) => (
                  <Card key={task.id} className="p-5 bg-card/40 border-primary/10 hover:border-primary/30 transition-all">
                    <div className="flex items-center gap-4">
                      <Checkbox
                        checked={task.completed}
                        onCheckedChange={() => toggleTask(task.id)}
                        className="h-6 w-6"
                      />
                      <div className="flex-1">
                        <p className={`font-semibold ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                          {task.title}
                        </p>
                        <p className="text-sm text-muted-foreground">{task.time}</p>
                      </div>
                      <Icon name="Clock" size={18} className="text-muted-foreground" />
                    </div>
                  </Card>
                ))}
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
