import mongoose from 'mongoose';
import { IProfile } from '../../models/Profile.js';
import { IPet } from '../../models/Pet.js';
import { IApplication } from '../../models/application.js';

interface CollectionValidators {
  profiles: mongoose.Collection;
  pets: mongoose.Collection;
  applications: mongoose.Collection;
}

const initializeSchema = async () => {
  try {
    // Type-safe profile model initialization
    const ProfileModel = mongoose.model<IProfile>('Profile');
    const PetModel = mongoose.model<IPet>('Pet');
    const ApplicationModel = mongoose.model<IApplication>('Application');

    // Create indexes with error handling
    const createCollectionIndexes = async () => {
      try {
        await Promise.all([
          // Profile indexes
          ProfileModel.collection.createIndexes([
            { key: { email: 1 }, unique: true },
            { key: { username: 1 }, unique: true }
          ]),

          // Pet indexes
          PetModel.collection.createIndexes([
            { key: { shelterId: 1 } },
            { key: { status: 1 } },
            { key: { breed: 1 } }
          ]),

          // Application indexes
          ApplicationModel.collection.createIndexes([
            { key: { petId: 1 } },
            { key: { adopterId: 1 } },
            { key: { status: 1 } },
            { key: { createdAt: 1 } }
          ])
        ]);
        console.log('Indexes created successfully');
      } catch (error) {
        console.error('Error creating indexes:', error);
        throw new Error('Failed to create indexes');
      }
    };

    // Create validators with error handling
    const createValidators = async () => {
      try {
        // Check if database connection exists
        if (!mongoose.connection.db) {
          throw new Error('Database connection not established');
        }

        const db = mongoose.connection.db;

        await Promise.all([
          // Profile validator
          db.command({
            collMod: "profiles",
            validator: {
              $jsonSchema: {
                bsonType: "object",
                required: ["username", "email", "password"],
                properties: {
                  username: {
                    bsonType: "string",
                    minLength: 3,
                    maxLength: 50
                  },
                  email: {
                    bsonType: "string",
                    pattern: "^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$"
                  },
                  password: {
                    bsonType: "string",
                    minLength: 6
                  },
                  savedPets: {
                    bsonType: "array",
                    items: {
                      bsonType: "objectId"
                    }
                  }
                }
              }
            },
            validationLevel: "moderate"
          }),

          // Pet validator
          db.command({
            collMod: "pets",
            validator: {
              $jsonSchema: {
                bsonType: "object",
                required: ["name", "shelterId"],
                properties: {
                  name: {
                    bsonType: "string",
                    minLength: 1,
                    maxLength: 100
                  },
                  breed: {
                    bsonType: "string",
                    maxLength: 100
                  },
                  age: {
                    bsonType: "int",
                    minimum: 0,
                    maximum: 100
                  },
                  status: {
                    bsonType: "string",
                    enum: ["Available", "Pending", "Adopted"]
                  }
                }
              }
            }
          }),

          // Application validator
          db.command({
            collMod: "applications",
            validator: {
              $jsonSchema: {
                bsonType: "object",
                required: ["petId", "message", "status"],
                properties: {
                  petId: {
                    bsonType: "objectId"
                  },
                  adopterId: {
                    bsonType: "objectId"
                  },
                  message: {
                    bsonType: "string",
                    minLength: 1,
                    maxLength: 1000
                  },
                  status: {
                    bsonType: "string",
                    enum: ["Pending", "Reviewed", "Accepted", "Rejected"]
                  }
                }
              }
            }
          })
        ]);
        console.log('Validators created successfully');
      } catch (error) {
        console.error('Error creating validators:', error);
        throw new Error('Failed to create validators');
      }
    };

    // Execute initialization steps
    await createCollectionIndexes();
    await createValidators();

    console.log('Schema initialization completed successfully');
  } catch (error) {
    console.error('Schema initialization failed:', error instanceof Error ? error.message : String(error));
    throw error;
  }
};

export default initializeSchema;