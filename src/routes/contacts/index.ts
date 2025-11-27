import express from "express";
import { addContact, getContact, getAllUserContacts, updateContact, temporaryDeleteContact, permanentlyDeleteContact  } from "../../controllers/contacts/index.ts";
import { authenticate } from "../../middleware/auth.ts";
const router = express.Router();

router.get('/all', authenticate, getAllUserContacts);
router.get('/:contactId', authenticate, getContact);
router.patch('/update/:contactId', authenticate, updateContact);
router.post('/add', authenticate, addContact);
router.patch('/remove', authenticate, temporaryDeleteContact);
router.patch('/delete', authenticate, permanentlyDeleteContact);

export default router;