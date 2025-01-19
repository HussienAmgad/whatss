const secretKey = '27071977'; // مفتاح سري لتوقيع التوكن (يجب أن يكون سريًا وآمنًا)
const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const jwt = require('jsonwebtoken'); // إضافة مكتبة JWT

const app = express();
const port = process.env.PORT || 8080;

// Middleware لتفسير الجسم (body) كـ JSON
app.use(express.json());

// إعداد اتصال MongoDB
const uri = "mongodb+srv://bosyahmad3005:27071977@cluster0.ma1nflp.mongodb.net/";
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
  tlsAllowInvalidCertificates: true // السماح بالشهادات غير الصالحة
});

// إضافة CORS كوسيط
app.use(cors());

// فتح اتصال MongoDB لمرة واحدة عند بدء الخادم
client.connect()
  .then(() => {
    console.log('Connected to MongoDB');
  })
  .catch(err => {
    console.error('MongoDB connection error:', err);
  });

app.post('/loginstudent', async (req, res) => {
    const { phonestudent, phoneparent } = req.body;
  
    if (!phonestudent || !phoneparent) {
      return res.status(400).json({ message: 'رقم هاتف الطالب وولي الأمر مطلوبان' });
    }
  
    try {
      const database = client.db("Mr");
      const collection = database.collection("student");
  
      // البحث عن الطالب باستخدام رقم الهاتف
      const student = await collection.findOne({
        phonestudent: phonestudent,
        phoneparent: phoneparent
      });
  
      if (!student) {
        return res.status(404).json({ message: 'الطالب أو رقم الهاتف غير صحيح' });
      }
  
      // توليد التوكن مع فترة صلاحية
      const token = jwt.sign({
          id: student._id,  // استخدم _id بدلاً من id إذا كان موجودًا في قاعدة البيانات
          name: student.name,
          phoneparent: student.phoneparent,
          phonestudent: student.phonestudent,
          grade: student.grade,
          center: student.center,
          statues: student.statues,
      }, '27071977', { expiresIn: '1h' });  // تحديد فترة الصلاحية
  
      // إعادة التوكن مع بيانات الطالب
      res.status(200).json({
        message: 'تم تسجيل الدخول بنجاح',
        token: token,
        student: {
          id: student.id,  // استخدم _id بدلاً من id إذا كان موجودًا في قاعدة البيانات
          name: student.name,
          phoneparent: student.phoneparent,
          phonestudent: student.phonestudent,
          statues: student.statues,
          grade: student.grade,
          center: student.center,
        }
      });
  
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول', error: error.message });
    }
});
app.post('/Loginassistant', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'رقم هاتف الطالب وولي الأمر مطلوبان' });
  }

  try {
    const database = client.db("Mr");
    const collection = database.collection("users");

    // البحث عن الطالب باستخدام رقم الهاتف
    const student = await collection.findOne({
      username: username,
      password: password
    });

    if (!student) {
      return res.status(404).json({ message: 'الطالب أو رقم الهاتف غير صحيح' });
    }

    // توليد التوكن
      // توليد التوكن مع فترة صلاحية
      const token = jwt.sign({
        id: student._id,  // استخدم _id بدلاً من id إذا كان موجودًا في قاعدة البيانات
        name: student.name,
        statues: student.statues,
    }, '27071977', { expiresIn: '1h' });  // تحديد فترة الصلاحية
    // إعادة التوكن مع بيانات الطالب
    res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      token: token,
      student: {
        name: student.name,
        username: student.username,
        password: student.password
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول', error: error.message });
  }
});
app.post('/loginmr', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: 'رقم هاتف الطالب وولي الأمر مطلوبان' });
  }

  try {
    const database = client.db("Mr");
    const collection = database.collection("admin");

    // البحث عن الطالب باستخدام رقم الهاتف
    const student = await collection.findOne({
      username: username,
      password: password
    });

    if (!student) {
      return res.status(404).json({ message: 'الطالب أو رقم الهاتف غير صحيح' });
    }

    // توليد التوكن
      // توليد التوكن مع فترة صلاحية
      const token = jwt.sign({
        id: student._id,  // استخدم _id بدلاً من id إذا كان موجودًا في قاعدة البيانات
        name: student.name,
        statues: student.statues,
    }, '27071977', { expiresIn: '1h' });  // تحديد فترة الصلاحية
    // إعادة التوكن مع بيانات الطالب
    res.status(200).json({
      message: 'تم تسجيل الدخول بنجاح',
      token: token,
      student: {
        name: student.name,
        username: student.username,
        password: student.password
      }
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء تسجيل الدخول', error: error.message });
  }
});
app.post('/addstudent', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("student");

    // الحصول على آخر id موجود
    const lastStudent = await collection.findOne({}, { sort: { id: -1 } });
    const newId = lastStudent ? lastStudent.id + 1 : 1; // زيادة id بمقدار 1 أو بدء من 1 إذا لم يوجد طلاب

    const newStudent = {
      id: newId,
      name: req.body.name,
      phoneparent: req.body.phoneparent,
      phonestudent: req.body.phonestudent,
      grade: req.body.grade,
      center: req.body.center,
      statues: "user",
      date: new Date() // إضافة التاريخ والوقت الحالي
    };

    // إدخال الطالب في قاعدة البيانات
    await collection.insertOne(newStudent);

    // إنشاء التوكن بناءً على بيانات الطالب
    const token = jwt.sign(
      {
        id: newStudent.id,
        name: newStudent.name,
        phoneparent: newStudent.phoneparent,
        phonestudent: newStudent.phonestudent,
        grade: newStudent.grade,
        center: newStudent.center,
      },
      secretKey,
    );

    res.status(201).json({
      message: 'تم إضافة الطالب بنجاح',
      student: newStudent,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة الطالب', error: error.message });
  }
});
app.post('/prep1', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("prep1");

    // استخراج البيانات المشتركة والطلاب من جسم الطلب
    const { date, grade, center, students,name  } = req.body;

    // إضافة grade و center و Exam و Attendance و Homework إلى كل طالب
    const studentsWithAdditionalData = students.map((student) => ({
      ...student,
      grade: grade || null,
      center: center || null,
      Exam: student.Exam || null,
      Attendance: student.Attendance || null,
      Homework: student.Homework || null,
    }));

    // حساب عدد الطلاب الحاضرين
    const attendance = studentsWithAdditionalData.filter(student => student.Attendance === true).length;

    const profit = attendance * 30; 
    // تكوين وثيقة البيانات للإدخال
    const document = {
      date: date ? new Date(date) : new Date(),
      grade: grade || null,
      center: center || null,
      attendance, // استخدام العدد المحسوب
      name,
      profit, // استخدام العدد المحسوب
      students: studentsWithAdditionalData,
    };

    // إدخال الوثيقة إلى قاعدة البيانات
    await collection.insertOne(document);

    res.status(201).json({ message: 'تم إضافة البيانات بنجاح إلى prep1', data: document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة البيانات إلى prep1', error: error.message });
  }
});
app.post('/prep2', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("prep2");

    // استخراج البيانات المشتركة والطلاب من جسم الطلب
    const { date, grade, center, students, name  } = req.body;

    // إضافة grade و center و Exam و Attendance و Homework إلى كل طالب
    const studentsWithAdditionalData = students.map((student) => ({
      ...student,
      grade: grade || null,
      center: center || null,
      Exam: student.Exam || null,
      Attendance: student.Attendance || null,
      Homework: student.Homework || null,
    }));

    // حساب عدد الطلاب الحاضرين
    const attendance = studentsWithAdditionalData.filter(student => student.Attendance === true).length;

    const profit = attendance * 30; 

    // تكوين وثيقة البيانات للإدخال
    const document = {
      date: date ? new Date(date) : new Date(),
      grade: grade || null,
      center: center || null,
      attendance, // استخدام العدد المحسوب
      name ,
      profit, // استخدام العدد المحسوب
      students: studentsWithAdditionalData,
    };

    // إدخال الوثيقة إلى قاعدة البيانات
    await collection.insertOne(document);

    res.status(201).json({ message: 'تم إضافة البيانات بنجاح إلى prep2', data: document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة البيانات إلى prep2', error: error.message });
  }
});
app.post('/prep3', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("prep3");
    
    // استخراج البيانات المشتركة والطلاب من جسم الطلب
    const { date, grade, center, students, name  } = req.body;
    
    // إضافة grade و center و Exam و Attendance و Homework إلى كل طالب
    const studentsWithAdditionalData = students.map((student) => ({
      ...student,
      grade: grade || null,
      center: center || null,
      Exam: student.Exam || null,
      Attendance: student.Attendance || null,
      Homework: student.Homework || null,
    }));

    // حساب عدد الطلاب الحاضرين
    const attendance = studentsWithAdditionalData.filter(student => student.Attendance === true).length;

    const profit = attendance * 30; 

    // تكوين وثيقة البيانات للإدخال
    const document = {
      date: date ? new Date(date) : new Date(),
      grade: grade || null,
      center: center || null,
      attendance, // استخدام العدد المحسوب
      profit, // استخدام العدد المحسوب
      name ,
      students: studentsWithAdditionalData,
    };
    
    // إدخال الوثيقة إلى قاعدة البيانات
    await collection.insertOne(document);
    
    res.status(201).json({ message: 'تم إضافة البيانات بنجاح إلى prep3', data: document });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة البيانات إلى prep3', error: error.message });
  }
});
app.put('/updatestudent/:id', async (req, res) => {
  try {
    const { id } = req.params;

    // التحقق من أن id صالح
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const objectId = new ObjectId(id);
    const database = client.db('Mr');
    const collectionRef = database.collection('student'); // تأكد من أن اسم المجموعة هو 'students'

    // استخراج البيانات من جسم الطلب
    const { name, phoneparent, phonestudent, grade, center } = req.body;

    // التحقق من أن جميع الحقول المطلوبة موجودة
    if (!name || !phoneparent || !phonestudent || !grade || !center) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updateData = {
      $set: {
        name,
        center,
        grade,
        phonestudent,
        phoneparent,
      },
    };

    // تحديث الوثيقة في قاعدة البيانات
    const result = await collectionRef.updateOne({ _id: objectId }, updateData);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.status(200).json({ message: 'Document updated successfully.', update: updateData });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
app.put('/update/:collection/:id', async (req, res) => {
  try {
    const { collection, id } = req.params;

    // التحقق من أن id صالح
    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const objectId = new ObjectId(id);
    const database = client.db('Mr');
    const collectionRef = database.collection(collection);

    // استخراج البيانات المشتركة والطلاب من جسم الطلب
    const { date, grade, center, students, modified  } = req.body;

    if (!Array.isArray(students)) {
      return res.status(400).json({ error: 'Invalid students format. Expected an array.' });
    }

    // إضافة grade و center و Exam و Attendance و Homework إلى كل طالب
    const studentsWithAdditionalData = students.map((student) => ({
      ...student,
      grade: grade || null,
      center: center || null,
      Exam: student.Exam || null,
      Attendance: student.Attendance || null,
      Homework: student.Homework || null,
    }));

    // حساب عدد الطلاب الحاضرين
    const attendance = studentsWithAdditionalData.filter(student => student.Attendance === true).length;
    const profit = attendance * 30; 

    // تكوين وثيقة البيانات للتحديث
    const updateData = {
      $set: {
        date: date ? new Date(date) : new Date(),
        grade: grade || null,
        center: center || null,
        attendance, // استخدام العدد المحسوب
        modified,
        profit, // استخدام العدد المحسوب
        students: studentsWithAdditionalData,
      },
    };

    // تحديث الوثيقة في قاعدة البيانات
    const result = await collectionRef.updateOne({ _id: objectId }, updateData);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.status(200).json({ message: 'Document updated successfully.', update: updateData });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
app.get('/', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("student");
    const students = await collection.find({}).toArray();

    if (students.length) {
      res.json(students);
    } else {
      res.status(404).send("لا يوجد طلاب");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post('/detailsassist', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("users");
    const students = await collection.find({}).toArray();

    if (students.length) {
      res.json(students);
    } else {
      res.status(404).send("لا يوجد طلاب");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.post('/detailsadmin', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("admin");
    const students = await collection.find({}).toArray();

    if (students.length) {
      res.json(students);
    } else {
      res.status(404).send("لا يوجد طلاب");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.put('/updateadmin/:name', async (req, res) => {
  try {
    const { name } = req.params; // الحصول على اسم المساعد من الرابط

    const database = client.db('Mr');
    const collectionRef = database.collection('admin'); // تأكد من أن اسم المجموعة هو 'users'

    // استخراج البيانات من جسم الطلب
    const { password, username } = req.body;

    // التحقق من أن جميع الحقول المطلوبة موجودة
    if (!password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updateData = {
      $set: {
        username,
        password,
      },
    };

    // تحديث الوثيقة في قاعدة البيانات باستخدام الاسم
    const result = await collectionRef.updateOne({ name }, updateData);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.status(200).json({ message: 'Document updated successfully.', update: updateData });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
app.post('/addassist', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("users");


    const newassist = {
      name: req.body.name,
      password: req.body.password,
      username: req.body.username,
      statues: "assist",
    };

    // إدخال الطالب في قاعدة البيانات
    await collection.insertOne(newassist);

    // إنشاء التوكن بناءً على بيانات الطالب
    const token = jwt.sign(
      {
        name: newassist.name,
        password: newassist.password,
        username: newassist.username,
        statues: newassist.statues,
      },
      secretKey,
    );

    res.status(201).json({
      message: 'تم إضافة الطالب بنجاح',
      student: newassist,
      token: token,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'حدث خطأ أثناء إضافة الطالب', error: error.message });
  }
});
app.put('/updateassist/:name', async (req, res) => {
  try {
    const { name } = req.params; // الحصول على اسم المساعد من الرابط

    const database = client.db('Mr');
    const collectionRef = database.collection('users'); // تأكد من أن اسم المجموعة هو 'users'

    // استخراج البيانات من جسم الطلب
    const { password, username } = req.body;

    // التحقق من أن جميع الحقول المطلوبة موجودة
    if (!password || !username) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const updateData = {
      $set: {
        username,
        password,
      },
    };

    // تحديث الوثيقة في قاعدة البيانات باستخدام الاسم
    const result = await collectionRef.updateOne({ name }, updateData);

    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Document not found.' });
    }

    res.status(200).json({ message: 'Document updated successfully.', update: updateData });
  } catch (error) {
    console.error('Error updating document:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
app.delete('/deleteassist/:name', async (req, res) => {
  try {
    const { name } = req.params;

    // الاتصال بقاعدة البيانات
    const database = client.db('Mr');
    const collectionRef = database.collection('users');  // تأكد من أن اسم المجموعة هو 'users'

    // البحث عن العنصر بناءً على الاسم
    const result = await collectionRef.deleteOne({ name });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: `No assistant found with the name: ${name}` });
    }

    res.status(200).json({ message: `Assistant with name ${name} has been deleted successfully.` });
  } catch (error) {
    console.error('Error deleting assistant:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
app.get('/showprep3', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("prep3");
    const students = await collection.find({}).toArray();

    if (students.length) {
      res.json(students);
    } else {
      res.status(404).send("لا يوجد طلاب");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get('/showprep2', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("prep2");
    const students = await collection.find({}).toArray();

    if (students.length) {
      res.json(students);
    } else {
      res.status(404).send("لا يوجد طلاب");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get('/showprep1', async (req, res) => {
  try {
    const database = client.db("Mr");
    const collection = database.collection("prep1");
    const students = await collection.find({}).toArray();

    if (students.length) {
      res.json(students);
    } else {
      res.status(404).send("لا يوجد طلاب");
    }
  } catch (error) {
    console.error(error);
    res.status(500).send("Internal Server Error");
  }
});
app.get('/showprep1/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // التأكد من أن id له طول 24 حرفًا للتأكد من أنه ObjectId صحيح
    if (id.length !== 24) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const objectId = new ObjectId(id);
    const database = client.db('Mr');
    const collection = database.collection('prep1');

    // البحث عن المستند باستخدام ObjectId
    const result = await collection.findOne({ _id: objectId });

    if (!result) {
      return res.status(404).json({ error: 'No document found with this ID' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
app.get('/showprep2/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // التأكد من أن id له طول 24 حرفًا للتأكد من أنه ObjectId صحيح
    if (id.length !== 24) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const objectId = new ObjectId(id);
    const database = client.db('Mr');
    const collection = database.collection('prep2');

    // البحث عن المستند باستخدام ObjectId
    const result = await collection.findOne({ _id: objectId });

    if (!result) {
      return res.status(404).json({ error: 'No document found with this ID' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});
app.get('/showprep3/:id', async (req, res) => {
  try {
    const id = req.params.id;

    // التأكد من أن id له طول 24 حرفًا للتأكد من أنه ObjectId صحيح
    if (id.length !== 24) {
      return res.status(400).json({ error: 'Invalid ID format' });
    }

    const objectId = new ObjectId(id);
    const database = client.db('Mr');
    const collection = database.collection('prep3');

    // البحث عن المستند باستخدام ObjectId
    const result = await collection.findOne({ _id: objectId });

    if (!result) {
      return res.status(404).json({ error: 'No document found with this ID' });
    }

    res.json(result);
  } catch (error) {
    console.error('Error fetching document:', error);
    res.status(500).json({ error: 'Internal Server Error', details: error.message });
  }
});

app.listen(port, () => console.log(`Listening to port ${port}`));