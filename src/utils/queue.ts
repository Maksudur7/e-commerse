/**
 * Mock Queue System for Background Tasks
 * In a production app, this would use BullMQ with Redis or RabbitMQ.
 * Here we simulate it using a simple event-driven worker for "Advanced Engineering" fulfillment.
 */

type Task = {
  id: string;
  type: 'EMAIL' | 'NOTIFICATION' | 'ANALYTICS';
  data: any;
  priority: number;
};

const queue: Task[] = [];

export const addToQueue = (type: Task['type'], data: any, priority = 0) => {
  const task: Task = {
    id: Math.random().toString(36).substr(2, 9),
    type,
    data,
    priority
  };
  
  queue.push(task);
  console.log(`[Queue] Task added: ${task.type} (ID: ${task.id})`);
  
  // Sort by priority
  queue.sort((a, b) => b.priority - a.priority);
  
  // Process next task
  processNext();
};

let isProcessing = false;

const processNext = async () => {
  if (isProcessing || queue.length === 0) return;
  
  isProcessing = true;
  const task = queue.shift();
  
  if (task) {
    console.log(`[Worker] Processing ${task.type}...`);
    
    // Simulate work
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    console.log(`[Worker] ${task.type} completed (ID: ${task.id})`);
  }
  
  isProcessing = false;
  processNext();
};
