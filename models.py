from flask_sqlalchemy import SQLAlchemy
from flask_login import UserMixin
# Initialize the database
db = SQLAlchemy()

# ----- User Model -----
class User(UserMixin, db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(150), unique=True, nullable=False)
    password = db.Column(db.String(150), nullable=False)

# ----- Availability Model -----
class Availability(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    start = db.Column(db.String, nullable=False)
    end = db.Column(db.String, nullable=False)
