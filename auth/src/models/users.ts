import mongoose from 'mongoose';
import { Password } from '../services/password';

// An interface that describes the properties 
// that are required to create a new user
interface UserAttrs {
    email: string;
    password: string;
}

// An interface that describes the properties
// that a User Model has
interface UserModel extends mongoose.Model<UserDoc> {
    build(attrs: UserAttrs): UserDoc;
}

// An interface that describes the properties
// that a User Model has
interface UserDoc extends mongoose.Document {
    email: string;
    password: string;
}

const userSchema = new mongoose.Schema( {
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, 
{
    toJSON: {
        // modifying mongoose's default json return
        // behaviors/values to exclude default values
        transform(doc, ret) {
            ret.id = ret._id;
            delete ret._id;
            delete ret.password;
            delete ret.__v;
        }
    }
});

// must use function because "this" must return the user
// document. The arrow method would return the context of
// the entire document to "this"
userSchema.pre('save', async function(done) {
    if(this.isModified('password')) {
        const hashed = await Password.toHash(this.get('password'));
        this.set('password', hashed);
        // console.log('hashed');
    }
    done();
})

userSchema.statics.build = (attrs: UserAttrs) => {
    return new User(attrs);
}

const User = mongoose.model<UserDoc, UserModel>('User', userSchema);

export { User };