from flask import Flask, request, jsonify
from flask_cors import CORS
import firebase_admin
from firebase_admin import credentials, firestore
import os
import json
from datetime import datetime

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize Firebase (using service account)
cred = credentials.Certificate('service-account.json')
firebase_admin.initialize_app(cred)
db = firestore.client()

@app.route('/api/service-requests', methods=['GET'])
def get_service_requests():
    """Get all service requests"""
    try:
        # Get status filter if provided
        status = request.args.get('status')
        
        # Create base query
        bookings_ref = db.collection('bookings')
        
        # Apply filters if provided
        if status:
            query = bookings_ref.where('status', '==', status)
        else:
            query = bookings_ref
            
        # Order by creation time
        query = query.order_by('createdAt', direction=firestore.Query.DESCENDING)
        
        # Execute query
        docs = query.stream()
        
        # Convert to list of dicts
        results = []
        for doc in docs:
            data = doc.to_dict()
            # Convert timestamps to strings for JSON serialization
            if 'createdAt' in data and data['createdAt']:
                data['createdAt'] = data['createdAt'].strftime('%Y-%m-%d %H:%M:%S')
            
            # Add document ID to the data
            data['id'] = doc.id
            results.append(data)
            
        return jsonify(results)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/service-requests/<request_id>', methods=['GET'])
def get_service_request(request_id):
    """Get a specific service request by ID"""
    try:
        doc_ref = db.collection('bookings').document(request_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Service request not found"}), 404
            
        data = doc.to_dict()
        
        # Convert timestamps to strings for JSON serialization
        if 'createdAt' in data and data['createdAt']:
            data['createdAt'] = data['createdAt'].strftime('%Y-%m-%d %H:%M:%S')
        
        # Add document ID to the data
        data['id'] = doc.id
        
        return jsonify(data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/service-requests/<request_id>/accept', methods=['POST'])
def accept_service_request(request_id):
    """Accept a service request"""
    try:
        # Get provider data from the request
        data = request.json
        print(data)
        provider_id = data.get('providerId')
        provider_name = data.get('providerName')
        
        if not provider_id or not provider_name:
            return jsonify({"error": "Provider ID and name are required"}), 400
        
        # Update the booking document
        doc_ref = db.collection('bookings').document(request_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Service request not found"}), 404
            
        # Update the document
        doc_ref.update({
            'status': 'accepted',
            'preferredProvider': provider_id,
            'providerName': provider_name,
            'acceptedAt': firestore.SERVER_TIMESTAMP
        })
        
        return jsonify({"message": "Service request accepted successfully"})
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/providers', methods=['GET'])
def get_providers():
    """Get all service providers"""
    try:
        providers_ref = db.collection('service_providers')
        docs = providers_ref.stream()
        
        results = []
        for doc in docs:
            data = doc.to_dict()
            # Add document ID to the data
            data['id'] = doc.id
            # Remove sensitive information
            if 'email' in data:
                del data['email']
            results.append(data)
            
        return jsonify(results)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/providers/<provider_id>', methods=['GET'])
def get_provider(provider_id):
    """Get a specific service provider by ID"""
    try:
        doc_ref = db.collection('service_providers').document(provider_id)
        doc = doc_ref.get()
        
        if not doc.exists:
            return jsonify({"error": "Provider not found"}), 404
            
        data = doc.to_dict()
        
        # Add document ID to the data
        data['id'] = doc.id
        
        # Remove sensitive information
        if 'email' in data:
            del data['email']
        
        return jsonify(data)
        
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)