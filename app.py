from flask import Flask, render_template, redirect, request, url_for, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_login import LoginManager, UserMixin, login_user, login_required, logout_user, current_user
from flask_cors import CORS
from datetime import datetime
from models import db, User, Availability

app = Flask(__name__)
app.secret_key = 'von-UDBNdsjf-4nfd!f9'
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///availability.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

db = SQLAlchemy(app)
CORS(app)  # Allows your main site to fetch data
login_manager = LoginManager(app)



# ----- Models -----
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True)
    password = db.Column(db.String(150))  # Store hashed passwords in production

class Availability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.String)
    end = db.Column(db.String)

# ----- Auth -----
@login_manager.user_loader
def load_user(user_id):
    return User.query.get(int(user_id))

@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        user = User.query.filter_by(username=request.form['username']).first()
        if user and user.password == request.form['password']:  # Use hashing in production
            login_user(user)
            return redirect(url_for('dashboard'))
    return render_template('login.html')

@app.route('/dashboard')
@login_required
def dashboard():
    return render_template('dashboard.html')

@app.route('/logout')
def logout():
    logout_user()
    return redirect(url_for('login'))

# ----- API -----
@app.route('/api/availability', methods=['GET', 'POST'])
@login_required
def availability():
    if request.method == 'POST':
        data = request.get_json()
        new = Availability(start=data['start'], end=data['end'])
        db.session.add(new)
        db.session.commit()
        return jsonify({'message': 'Added'}), 201
    else:
        all_slots = Availability.query.all()
        return jsonify([
            {'title': 'Available', 'start': slot.start, 'end': slot.end}
            for slot in all_slots
        ])
@app.route('/api/availability/<date_str>', methods=['DELETE'])
@login_required
def delete_availability(date_str):
    # Delete all availability for the specified date
    slots_to_delete = Availability.query.filter(Availability.start.startswith(date_str)).all()
    for slot in slots_to_delete:
        db.session.delete(slot)
    db.session.commit()
    return jsonify({'message': 'Availability removed'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        if not User.query.filter_by(username='client').first():
            user = User(username='client', password='secret123')
            db.session.add(user)
            db.session.commit()
            print("Client user created.")
    app.run(debug=True)