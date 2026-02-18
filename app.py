from flask import Flask, render_template, request, redirect, url_for, session, jsonify, flash
import json
import os
from datetime import datetime, timedelta 
import uuid
   
app = Flask(__name__) 
app.secret_key = 'library-management-system-secret-key'
app.config['SESSION_TYPE'] = 'filesystem'
app.config['PERMANENT_SESSION_LIFETIME'] = timedelta(days=7)

# Sample books data
SAMPLE_BOOKS = [
    {
        "id": "book-1",
        "title": "To Kill a Mockingbird",
        "author": "Harper Lee",
        "isbn": "9780061120084",
        "genre": "Fiction"
    },
    {
        "id": "book-2",
        "title": "1984",
        "author": "George Orwell",
        "isbn": "9780451524935",
        "genre": "Science Fiction"
    },
    {
        "id": "book-3",
        "title": "The Great Gatsby",
        "author": "F. Scott Fitzgerald",
        "isbn": "9780743273565",
        "genre": "Fiction"
    },
    {
        "id": "book-4",
        "title": "Pride and Prejudice",
        "author": "Jane Austen",
        "isbn": "9780141439518",
        "genre": "Romance"
    },
    {
        "id": "book-5",
        "title": "The Catcher in the Rye",
        "author": "J.D. Salinger",
        "isbn": "9780316769488",
        "genre": "Fiction"
    },
    {
        "id": "book-6",
        "title": "The Hobbit",
        "author": "J.R.R. Tolkien",
        "isbn": "9780547928227",
        "genre": "Fantasy"
    },
    {
        "id": "book-7",
        "title": "Harry Potter and the Philosopher's Stone",
        "author": "J.K. Rowling",
        "isbn": "9780747532743",
        "genre": "Fantasy"
    },
    {
        "id": "book-8",
        "title": "The Lord of the Rings",
        "author": "J.R.R. Tolkien",
        "isbn": "9780618640157",
        "genre": "Fantasy"
    },
    {
        "id": "book-9",
        "title": "The Alchemist",
        "author": "Paulo Coelho",
        "isbn": "9780062315007",
        "genre": "Fiction"
    },
    {
        "id": "book-10",
        "title": "The Da Vinci Code",
        "author": "Dan Brown",
        "isbn": "9780307474278",
        "genre": "Mystery"
    },
    {
        "id": "book-11",
        "title": "The Hunger Games",
        "author": "Suzanne Collins",
        "isbn": "9780439023481",
        "genre": "Science Fiction"
    },
    {
        "id": "book-12",
        "title": "The Shining",
        "author": "Stephen King",
        "isbn": "9780307743657",
        "genre": "Horror"
    },
    {
        "id": "book-13",
        "title": "Brave New World",
        "author": "Aldous Huxley",
        "isbn": "9780060850524",
        "genre": "Science Fiction"
    },
    {
        "id": "book-14",
        "title": "The Odyssey",
        "author": "Homer",
        "isbn": "9780140268867",
        "genre": "Classic"
    },
    {
        "id": "book-15",
        "title": "Moby-Dick",
        "author": "Herman Melville",
        "isbn": "9780142437247",
        "genre": "Adventure"
    }
]

# Initialize data
def init_data():
    if 'books' not in session:
        session['books'] = SAMPLE_BOOKS
    if 'students' not in session:
        session['students'] = []
    if 'issued_books' not in session:
        session['issued_books'] = []

# Helper functions
def get_book_by_id(book_id):
    for book in session['books']:
        if book['id'] == book_id:
            return book
    return None

def get_student_by_id(student_id):
    for student in session['students']:
        if student['id'] == student_id:
            return student
    return None

def get_available_books():
    issued_book_ids = [issue['bookId'] for issue in session['issued_books']]
    return [book for book in session['books'] if book['id'] not in issued_book_ids]

def get_student_issued_books(student_id):
    return [issue for issue in session['issued_books'] if issue['studentId'] == student_id]

def is_admin():
    return session.get('user_role') == 'admin'

def is_student():
    return session.get('user_role') == 'student'

def login_required(f):
    def decorated_function(*args, **kwargs):
        if 'user_id' not in session:
            return redirect(url_for('index'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

def admin_required(f):
    def decorated_function(*args, **kwargs):
        if not is_admin():
            flash('Access denied. Admin privileges required.', 'error')
            return redirect(url_for('dashboard'))
        return f(*args, **kwargs)
    decorated_function.__name__ = f.__name__
    return decorated_function

# Routes
@app.route('/')
def index():
    init_data()
    if 'user_id' in session:
        return redirect(url_for('dashboard'))
    return render_template('index.html')

@app.route('/login/admin', methods=['GET', 'POST'])
def admin_login():
    if request.method == 'POST':
        username = request.form.get('username')
        password = request.form.get('password')
        
        if username == 'admin' and password == '123':
            session['user_id'] = 'admin'
            session['user_name'] = 'Admin'
            session['user_role'] = 'admin'
            flash('Welcome back, Admin!', 'success')
            return redirect(url_for('dashboard'))
        else:
            flash('Invalid credentials. Please try again.', 'error')
    
    return render_template('login/admin.html')

@app.route('/login/student', methods=['GET', 'POST'])
def student_login():
    if request.method == 'POST':
        action = request.form.get('action')
        
        if action == 'login':
            username = request.form.get('username')
            password = request.form.get('password')
            
            for student in session['students']:
                if student['username'] == username and student['password'] == password:
                    session['user_id'] = student['id']
                    session['user_name'] = student['name']
                    session['user_role'] = 'student'
                    flash(f'Welcome back, {student["name"]}!', 'success')
                    return redirect(url_for('dashboard'))
            
            flash('Invalid credentials. Please try again.', 'error')
        
        elif action == 'register':
            name = request.form.get('name')
            username = request.form.get('username')
            password = request.form.get('password')
            roll_no = request.form.get('roll_no')
            
            # Check if username already exists
            if any(s['username'] == username for s in session['students']):
                flash('Username already exists. Please choose another.', 'error')
                return redirect(url_for('student_login'))
            
            new_student = {
                'id': f'student-{uuid.uuid4()}',
                'name': name,
                'username': username,
                'password': password,
                'rollNo': roll_no
            }
            
            students = session['students']
            students.append(new_student)
            session['students'] = students
            
            flash('Registration successful! You can now login.', 'success')
            return redirect(url_for('student_login'))
    
    return render_template('login/student.html')

@app.route('/logout')
def logout():
    session.pop('user_id', None)
    session.pop('user_name', None)
    session.pop('user_role', None)
    flash('You have been logged out successfully.', 'success')
    return redirect(url_for('index'))

@app.route('/dashboard')
@login_required
def dashboard():
    user = {
        'id': session.get('user_id'),
        'name': session.get('user_name'),
        'role': session.get('user_role')
    }
    
    total_books = len(session['books'])
    total_students = len(session['students'])
    total_issued = len(session['issued_books'])
    
    if is_student():
        user_issued = len(get_student_issued_books(user['id']))
    else:
        user_issued = total_issued
    
    available_books = total_books - total_issued
    
    return render_template(
        'dashboard/index.html',
        user=user,
        total_books=total_books,
        total_students=total_students,
        total_issued=total_issued,
        user_issued=user_issued,
        available_books=available_books
    )

@app.route('/dashboard/books')
@login_required
def books():
    user = {
        'id': session.get('user_id'),
        'name': session.get('user_name'),
        'role': session.get('user_role')
    }
    
    books_list = session['books']
    issued_book_ids = [issue['bookId'] for issue in session['issued_books']]
    
    return render_template(
        'dashboard/books.html',
        user=user,
        books=books_list,
        issued_book_ids=issued_book_ids
    )

@app.route('/dashboard/books/add', methods=['GET', 'POST'])
@login_required
@admin_required
def add_book():
    if request.method == 'POST':
        title = request.form.get('title')
        author = request.form.get('author')
        isbn = request.form.get('isbn')
        genre = request.form.get('genre')
        
        # Check if ISBN already exists
        if any(book['isbn'] == isbn for book in session['books']):
            flash('A book with this ISBN already exists.', 'error')
            return redirect(url_for('add_book'))
        
        new_book = {
            'id': f'book-{uuid.uuid4()}',
            'title': title,
            'author': author,
            'isbn': isbn,
            'genre': genre
        }
        
        books = session['books']
        books.append(new_book)
        session['books'] = books
        
        flash('Book added successfully!', 'success')
        return redirect(url_for('books'))
    
    return render_template(
        'dashboard/add_book.html',
        user={
            'id': session.get('user_id'),
            'name': session.get('user_name'),
            'role': session.get('user_role')
        }
    )

@app.route('/dashboard/books/edit/<book_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_book(book_id):
    book = get_book_by_id(book_id)
    
    if not book:
        flash('Book not found.', 'error')
        return redirect(url_for('books'))
    
    if request.method == 'POST':
        title = request.form.get('title')
        author = request.form.get('author')
        isbn = request.form.get('isbn')
        genre = request.form.get('genre')
        
        # Check if ISBN already exists and is not the current book
        if any(b['isbn'] == isbn and b['id'] != book_id for b in session['books']):
            flash('A book with this ISBN already exists.', 'error')
            return redirect(url_for('edit_book', book_id=book_id))
        
        books = session['books']
        for i, b in enumerate(books):
            if b['id'] == book_id:
                books[i] = {
                    'id': book_id,
                    'title': title,
                    'author': author,
                    'isbn': isbn,
                    'genre': genre
                }
                break
        
        session['books'] = books
        flash('Book updated successfully!', 'success')
        return redirect(url_for('books'))
    
    return render_template(
        'dashboard/edit_book.html',
        user={
            'id': session.get('user_id'),
            'name': session.get('user_name'),
            'role': session.get('user_role')
        },
        book=book
    )

@app.route('/dashboard/books/delete/<book_id>', methods=['POST'])
@login_required
@admin_required
def delete_book(book_id):
    # Check if book is issued
    if any(issue['bookId'] == book_id for issue in session['issued_books']):
        flash('Cannot delete book. It is currently issued to a student.', 'error')
        return redirect(url_for('books'))
    
    books = session['books']
    books = [book for book in books if book['id'] != book_id]
    session['books'] = books
    
    flash('Book deleted successfully!', 'success')
    return redirect(url_for('books'))

@app.route('/dashboard/issue-book', methods=['GET', 'POST'])
@login_required
@admin_required
def issue_book():
    available_books = get_available_books()
    students_list = session['students']
    
    if request.method == 'POST':
        book_id = request.form.get('book')
        student_id = request.form.get('student')
        issue_date_str = request.form.get('issue_date')
        
        if not book_id or not student_id or not issue_date_str:
            flash('Please select both a book and a student.', 'error')
            return redirect(url_for('issue_book'))
        
        # Parse issue date
        issue_date = datetime.strptime(issue_date_str, '%Y-%m-%d').strftime('%Y-%m-%d')
        # Calculate return date (7 days later)
        return_date = (datetime.strptime(issue_date_str, '%Y-%m-%d') + timedelta(days=7)).strftime('%Y-%m-%d')
        
        new_issue = {
            'id': f'issue-{uuid.uuid4()}',
            'bookId': book_id,
            'studentId': student_id,
            'issueDate': issue_date,
            'returnDate': return_date,
            'status': 'issued'
        }
        
        issued_books = session['issued_books']
        issued_books.append(new_issue)
        session['issued_books'] = issued_books
        
        flash('Book issued successfully!', 'success')
        return redirect(url_for('issued_books'))
    
    return render_template(
        'dashboard/issue_book.html',
        user={
            'id': session.get('user_id'),
            'name': session.get('user_name'),
            'role': session.get('user_role')
        },
        books=available_books,
        students=students_list
    )

@app.route('/dashboard/request-book', methods=['GET', 'POST'])
@login_required
def request_book():
    if not is_student():
        return redirect(url_for('issue_book'))
    
    available_books = get_available_books()
    
    if request.method == 'POST':
        book_id = request.form.get('book')
        issue_date_str = request.form.get('issue_date')
        
        if not book_id or not issue_date_str:
            flash('Please select a book.', 'error')
            return redirect(url_for('request_book'))
        
        # Parse issue date
        issue_date = datetime.strptime(issue_date_str, '%Y-%m-%d').strftime('%Y-%m-%d')
        # Calculate return date (7 days later)
        return_date = (datetime.strptime(issue_date_str, '%Y-%m-%d') + timedelta(days=7)).strftime('%Y-%m-%d')
        
        new_request = {
            'id': f'request-{uuid.uuid4()}',
            'bookId': book_id,
            'studentId': session['user_id'],
            'issueDate': issue_date,
            'returnDate': return_date,
            'status': 'requested'
        }
        
        issued_books = session['issued_books']
        issued_books.append(new_request)
        session['issued_books'] = issued_books
        
        flash('Book request submitted successfully!', 'success')
        return redirect(url_for('issued_books'))
    
    return render_template(
        'dashboard/request_book.html',
        user={
            'id': session.get('user_id'),
            'name': session.get('user_name'),
            'role': session.get('user_role')
        },
        books=available_books
    )

@app.route('/dashboard/issued-books')
@login_required
def issued_books():
    user = {
        'id': session.get('user_id'),
        'name': session.get('user_name'),
        'role': session.get('user_role')
    }
    
    if is_student():
        issues = get_student_issued_books(user['id'])
    else:
        issues = session['issued_books']
    
    # Add book and student details to each issue
    for issue in issues:
        book = get_book_by_id(issue['bookId'])
        student = get_student_by_id(issue['studentId'])
        
        if book:
            issue['book'] = book
        else:
            issue['book'] = {'title': 'Unknown Book', 'author': 'Unknown Author'}
        
        if student:
            issue['student'] = student
        else:
            issue['student'] = {'name': 'Unknown Student', 'rollNo': 'N/A'}
    
    return render_template(
        'dashboard/issued_books.html',
        user=user,
        issues=issues,
        today=datetime.now().strftime('%Y-%m-%d')
    )

@app.route('/dashboard/return-book/<issue_id>', methods=['POST'])
@login_required
def return_book(issue_id):
    issued_books = session['issued_books']
    issued_books = [issue for issue in issued_books if issue['id'] != issue_id]
    session['issued_books'] = issued_books
    
    flash('Book returned successfully!', 'success')
    return redirect(url_for('issued_books'))

@app.route('/dashboard/approve-request/<request_id>', methods=['POST'])
@login_required
@admin_required
def approve_request(request_id):
    issued_books = session['issued_books']
    
    for i, issue in enumerate(issued_books):
        if issue['id'] == request_id:
            issued_books[i]['status'] = 'issued'
            break
    
    session['issued_books'] = issued_books
    flash('Book request approved!', 'success')
    return redirect(url_for('issued_books'))

@app.route('/dashboard/users')
@login_required
@admin_required
def users():
    students_list = session['students']
    
    # Add issued books count to each student
    for student in students_list:
        student_issues = get_student_issued_books(student['id'])
        student['issued_count'] = len(student_issues)
        student['has_requests'] = any(issue['status'] == 'requested' for issue in student_issues)
    
    return render_template(
        'dashboard/users.html',
        user={
            'id': session.get('user_id'),
            'name': session.get('user_name'),
            'role': session.get('user_role')
        },
        students=students_list
    )

@app.route('/dashboard/users/edit/<student_id>', methods=['GET', 'POST'])
@login_required
@admin_required
def edit_user(student_id):
    student = get_student_by_id(student_id)
    
    if not student:
        flash('Student not found.', 'error')
        return redirect(url_for('users'))
    
    if request.method == 'POST':
        name = request.form.get('name')
        username = request.form.get('username')
        roll_no = request.form.get('roll_no')
        password = request.form.get('password')
        
        # Check if username already exists and is not the current student
        if any(s['username'] == username and s['id'] != student_id for s in session['students']):
            flash('Username already exists. Please choose another.', 'error')
            return redirect(url_for('edit_user', student_id=student_id))
        
        students = session['students']
        for i, s in enumerate(students):
            if s['id'] == student_id:
                students[i] = {
                    'id': student_id,
                    'name': name,
                    'username': username,
                    'rollNo': roll_no,
                    'password': password
                }
                break
        
        session['students'] = students
        flash('Student updated successfully!', 'success')
        return redirect(url_for('users'))
    
    return render_template(
        'dashboard/edit_user.html',
        user={
            'id': session.get('user_id'),
            'name': session.get('user_name'),
            'role': session.get('user_role')
        },
        student=student
    )

@app.route('/dashboard/users/delete/<student_id>', methods=['POST'])
@login_required
@admin_required
def delete_user(student_id):
    # Check if student has issued books
    if any(issue['studentId'] == student_id for issue in session['issued_books']):
        flash('Cannot delete student. They have issued books.', 'error')
        return redirect(url_for('users'))
    
    students = session['students']
    students = [student for student in students if student['id'] != student_id]
    session['students'] = students
    
    flash('Student deleted successfully!', 'success')
    return redirect(url_for('users'))

# API routes for AJAX
@app.route('/api/books/<book_id>')
def api_get_book(book_id):
    book = get_book_by_id(book_id)
    if book:
        return jsonify(book)
    return jsonify({'error': 'Book not found'}), 404

@app.route('/api/students/<student_id>')
def api_get_student(student_id):
    student = get_student_by_id(student_id)
    if student:
        return jsonify(student)
    return jsonify({'error': 'Student not found'}), 404

if __name__ == '__main__':
    app.run(debug=True)
