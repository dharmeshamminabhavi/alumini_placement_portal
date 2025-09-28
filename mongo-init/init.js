// MongoDB initialization script
// This script runs when the MongoDB container starts for the first time

// Switch to the alumni-portal database
db = db.getSiblingDB('alumni-portal');

// Create collections with validation
db.createCollection('users', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'email', 'password', 'userType'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 100
        },
        email: {
          bsonType: 'string',
          pattern: '^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
        },
        password: {
          bsonType: 'string',
          minLength: 6
        },
        userType: {
          bsonType: 'string',
          enum: ['student', 'alumni', 'admin']
        }
      }
    }
  }
});

db.createCollection('companies', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['name', 'industry', 'location'],
      properties: {
        name: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 100
        },
        industry: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 50
        },
        location: {
          bsonType: 'string',
          minLength: 2,
          maxLength: 100
        }
      }
    }
  }
});

db.createCollection('reviews', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['company', 'user', 'rating', 'title', 'content'],
      properties: {
        company: {
          bsonType: 'objectId'
        },
        user: {
          bsonType: 'objectId'
        },
        rating: {
          bsonType: 'number',
          minimum: 1,
          maximum: 5
        },
        title: {
          bsonType: 'string',
          minLength: 5,
          maxLength: 200
        },
        content: {
          bsonType: 'string',
          minLength: 10,
          maxLength: 2000
        }
      }
    }
  }
});

// Create indexes for better performance
db.users.createIndex({ email: 1 }, { unique: true });
db.companies.createIndex({ name: 1 });
db.companies.createIndex({ industry: 1 });
db.companies.createIndex({ location: 1 });
db.reviews.createIndex({ company: 1 });
db.reviews.createIndex({ user: 1 });
db.reviews.createIndex({ rating: 1 });
db.reviews.createIndex({ createdAt: -1 });

print('MongoDB initialization completed successfully!');
