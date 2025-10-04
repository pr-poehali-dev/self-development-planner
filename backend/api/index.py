import json
import os
import psycopg2
from typing import Dict, Any

def get_db_connection():
    dsn = os.environ.get('DATABASE_URL')
    return psycopg2.connect(dsn)

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: API для управления целями и задачами платформы саморазвития
    Args: event - dict с httpMethod, body, queryStringParameters
          context - object с request_id
    Returns: HTTP response dict с данными целей/задач
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': '',
            'isBase64Encoded': False
        }
    
    conn = get_db_connection()
    cur = conn.cursor()
    
    try:
        if method == 'GET':
            params = event.get('queryStringParameters', {}) or {}
            endpoint = params.get('endpoint', 'goals')
            
            if endpoint == 'goals':
                cur.execute('SELECT id, title, category, progress, completed FROM goals ORDER BY id')
                rows = cur.fetchall()
                goals = [
                    {'id': r[0], 'title': r[1], 'category': r[2], 'progress': r[3], 'completed': r[4]}
                    for r in rows
                ]
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'goals': goals}),
                    'isBase64Encoded': False
                }
            
            elif endpoint == 'tasks':
                cur.execute('SELECT id, title, time, completed FROM tasks WHERE task_date = CURRENT_DATE ORDER BY id')
                rows = cur.fetchall()
                tasks = [
                    {'id': r[0], 'title': r[1], 'time': r[2], 'completed': r[3]}
                    for r in rows
                ]
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'tasks': tasks}),
                    'isBase64Encoded': False
                }
        
        elif method == 'POST':
            body_data = json.loads(event.get('body', '{}'))
            action = body_data.get('action')
            
            if action == 'add_goal':
                title = body_data.get('title')
                category = body_data.get('category', 'goals')
                cur.execute(
                    "INSERT INTO goals (title, category, progress, completed) VALUES (%s, %s, 0, false) RETURNING id",
                    (title, category)
                )
                goal_id = cur.fetchone()[0]
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': goal_id, 'message': 'Goal added'}),
                    'isBase64Encoded': False
                }
            
            elif action == 'add_task':
                title = body_data.get('title')
                time = body_data.get('time', '12:00')
                cur.execute(
                    "INSERT INTO tasks (title, time, completed, task_date) VALUES (%s, %s, false, CURRENT_DATE) RETURNING id",
                    (title, time)
                )
                task_id = cur.fetchone()[0]
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'id': task_id, 'message': 'Task added'}),
                    'isBase64Encoded': False
                }
        
        elif method == 'PUT':
            body_data = json.loads(event.get('body', '{}'))
            endpoint = body_data.get('endpoint')
            item_id = body_data.get('id')
            
            if endpoint == 'goal':
                completed = body_data.get('completed')
                progress = body_data.get('progress')
                
                if completed is not None:
                    cur.execute('UPDATE goals SET completed = %s WHERE id = %s', (completed, item_id))
                if progress is not None:
                    cur.execute('UPDATE goals SET progress = %s WHERE id = %s', (progress, item_id))
                
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Goal updated'}),
                    'isBase64Encoded': False
                }
            
            elif endpoint == 'task':
                completed = body_data.get('completed')
                cur.execute('UPDATE tasks SET completed = %s WHERE id = %s', (completed, item_id))
                conn.commit()
                return {
                    'statusCode': 200,
                    'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
                    'body': json.dumps({'message': 'Task updated'}),
                    'isBase64Encoded': False
                }
        
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'}),
            'isBase64Encoded': False
        }
    
    finally:
        cur.close()
        conn.close()
