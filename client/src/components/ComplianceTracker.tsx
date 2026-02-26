import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertCircle, CheckCircle2, Plus, Calendar } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface ComplianceTask {
  id: string;
  task_type: string;
  task_name: string;
  due_date: string;
  completed: boolean;
  amount_due?: number;
}

export default function ComplianceTracker({ entityId }: { entityId: string }) {
  const [tasks, setTasks] = useState<ComplianceTask[]>([]);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newTask, setNewTask] = useState({
    task_type: 'annual_report',
    task_name: '',
    due_date: '',
    amount_due: ''
  });
  const { toast } = useToast();

  useEffect(() => {
    loadTasks();
  }, [entityId]);

  const loadTasks = async () => {
    const { data, error } = await supabase
      .from('entity_compliance_tasks')
      .select('*')
      .eq('entity_id', entityId)
      .order('due_date', { ascending: true });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      setTasks(data || []);
    }
  };

  const addTask = async () => {
    const { error } = await supabase.from('entity_compliance_tasks').insert({
      entity_id: entityId,
      ...newTask,
      amount_due: newTask.amount_due ? parseFloat(newTask.amount_due) : null
    });

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: 'Compliance task added' });
      setShowAddDialog(false);
      setNewTask({ task_type: 'annual_report', task_name: '', due_date: '', amount_due: '' });
      loadTasks();
    }
  };

  const toggleComplete = async (taskId: string, completed: boolean) => {
    const { error } = await supabase
      .from('entity_compliance_tasks')
      .update({ completed: !completed, completed_at: !completed ? new Date().toISOString() : null })
      .eq('id', taskId);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      loadTasks();
    }
  };

  const upcomingTasks = tasks.filter(t => !t.completed && new Date(t.due_date) >= new Date());
  const overdueTasks = tasks.filter(t => !t.completed && new Date(t.due_date) < new Date());
  const completedTasks = tasks.filter(t => t.completed);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Compliance Tracker
          </span>
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button size="sm"><Plus className="h-4 w-4 mr-2" />Add Task</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Compliance Task</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label>Task Type</Label>
                  <Select value={newTask.task_type} onValueChange={v => setNewTask({ ...newTask, task_type: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="annual_report">Annual Report</SelectItem>
                      <SelectItem value="franchise_tax">Franchise Tax</SelectItem>
                      <SelectItem value="state_filing">State Filing</SelectItem>
                      <SelectItem value="federal_filing">Federal Filing</SelectItem>
                      <SelectItem value="renewal">Renewal</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Task Name</Label>
                  <Input value={newTask.task_name} onChange={e => setNewTask({ ...newTask, task_name: e.target.value })} />
                </div>
                <div>
                  <Label>Due Date</Label>
                  <Input type="date" value={newTask.due_date} onChange={e => setNewTask({ ...newTask, due_date: e.target.value })} />
                </div>
                <div>
                  <Label>Amount Due (optional)</Label>
                  <Input type="number" value={newTask.amount_due} onChange={e => setNewTask({ ...newTask, amount_due: e.target.value })} />
                </div>
                <Button onClick={addTask} className="w-full">Add Task</Button>
              </div>
            </DialogContent>
          </Dialog>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {overdueTasks.length > 0 && (
          <div>
            <h3 className="font-semibold text-red-600 mb-3 flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Overdue ({overdueTasks.length})
            </h3>
            <div className="space-y-2">
              {overdueTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-red-50 rounded-lg">
                  <Checkbox checked={task.completed} onCheckedChange={() => toggleComplete(task.id, task.completed)} />
                  <div className="flex-1">
                    <p className="font-medium">{task.task_name}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  </div>
                  {task.amount_due && <Badge variant="destructive">${task.amount_due}</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {upcomingTasks.length > 0 && (
          <div>
            <h3 className="font-semibold mb-3">Upcoming ({upcomingTasks.length})</h3>
            <div className="space-y-2">
              {upcomingTasks.map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-muted rounded-lg">
                  <Checkbox checked={task.completed} onCheckedChange={() => toggleComplete(task.id, task.completed)} />
                  <div className="flex-1">
                    <p className="font-medium">{task.task_name}</p>
                    <p className="text-sm text-muted-foreground">Due: {new Date(task.due_date).toLocaleDateString()}</p>
                  </div>
                  {task.amount_due && <Badge>${task.amount_due}</Badge>}
                </div>
              ))}
            </div>
          </div>
        )}

        {completedTasks.length > 0 && (
          <div>
            <h3 className="font-semibold text-green-600 mb-3 flex items-center gap-2">
              <CheckCircle2 className="h-4 w-4" />
              Completed ({completedTasks.length})
            </h3>
            <div className="space-y-2">
              {completedTasks.slice(0, 3).map(task => (
                <div key={task.id} className="flex items-center gap-3 p-3 bg-green-50 rounded-lg opacity-60">
                  <Checkbox checked={task.completed} onCheckedChange={() => toggleComplete(task.id, task.completed)} />
                  <div className="flex-1">
                    <p className="font-medium line-through">{task.task_name}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}