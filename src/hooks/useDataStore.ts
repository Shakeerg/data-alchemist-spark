
import { useState, useCallback } from 'react';
import { DataStore, Client, Worker, Task, Rule, ValidationError } from '@/types/data';

export const useDataStore = () => {
  const [data, setData] = useState<DataStore>({
    clients: [],
    workers: [],
    tasks: [],
    rules: [],
    validationErrors: []
  });

  const updateClients = useCallback((clients: Client[]) => {
    setData(prev => ({ ...prev, clients }));
  }, []);

  const updateWorkers = useCallback((workers: Worker[]) => {
    setData(prev => ({ ...prev, workers }));
  }, []);

  const updateTasks = useCallback((tasks: Task[]) => {
    setData(prev => ({ ...prev, tasks }));
  }, []);

  const addRule = useCallback((rule: Rule) => {
    setData(prev => ({ ...prev, rules: [...prev.rules, rule] }));
  }, []);

  const updateRule = useCallback((ruleId: string, updates: Partial<Rule>) => {
    setData(prev => ({
      ...prev,
      rules: prev.rules.map(rule => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      )
    }));
  }, []);

  const deleteRule = useCallback((ruleId: string) => {
    setData(prev => ({
      ...prev,
      rules: prev.rules.filter(rule => rule.id !== ruleId)
    }));
  }, []);

  const setValidationErrors = useCallback((errors: ValidationError[]) => {
    setData(prev => ({ ...prev, validationErrors: errors }));
  }, []);

  return {
    data,
    updateClients,
    updateWorkers,
    updateTasks,
    addRule,
    updateRule,
    deleteRule,
    setValidationErrors
  };
};
