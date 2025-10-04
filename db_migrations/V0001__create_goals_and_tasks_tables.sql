CREATE TABLE IF NOT EXISTS goals (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  category TEXT NOT NULL,
  progress INTEGER DEFAULT 0,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS tasks (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  time TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  task_date DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO goals (title, category, progress, completed) VALUES
('Прочитать 2 книги в месяц', 'study', 65, false),
('Тренировки 4 раза в неделю', 'health', 80, false),
('Уход за кожей утром и вечером', 'appearance', 45, false),
('Медитация 15 минут ежедневно', 'health', 30, false);

INSERT INTO tasks (title, time, completed) VALUES
('Утренняя зарядка', '07:00', false),
('Изучение английского', '09:00', false),
('Работа над проектом', '14:00', false),
('Вечерняя пробежка', '18:00', false);
