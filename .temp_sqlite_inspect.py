import sqlite3, os
path = os.path.join('backend', 'healthcult.db')
print('DB path:', os.path.abspath(path))
conn = sqlite3.connect(path)
c = conn.cursor()
for tbl in ['patients', 'risk_assessments', 'users']:
    try:
        c.execute(f'SELECT count(*) FROM {tbl}')
        print(tbl, c.fetchone()[0])
    except Exception as e:
        print(tbl, 'ERROR', e)
print('\n--- patients ---')
for row in c.execute('SELECT id, user_id, external_ref, created_at FROM patients LIMIT 5'):
    print(row)
print('\n--- assessments ---')
for row in c.execute('SELECT id, patient_id, model_type, risk_score, risk_band, created_at FROM risk_assessments LIMIT 10'):
    print(row)
conn.close()