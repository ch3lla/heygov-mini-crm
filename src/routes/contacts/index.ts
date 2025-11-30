import express from "express";
import { addContact, getContact, getAllUserContacts, updateContact, temporaryDeleteContact, permanentlyDeleteContact, getUsersTrashSites, restoreUserContact  } from "../../controllers/contacts/index.ts";
import { authenticate } from "../../middleware/auth.ts";
const router = express.Router();

router.get('/all', authenticate, getAllUserContacts);
router.get('/trash', authenticate, getUsersTrashSites);
router.post('/add', authenticate, addContact);
router.get('/:contactId', authenticate, getContact);
router.patch('/update/:contactId', authenticate, updateContact);
router.patch('/remove/:contactId', authenticate, temporaryDeleteContact);
router.patch('/delete/:contactId', authenticate, permanentlyDeleteContact);
router.patch('/restore/:contactId', authenticate, restoreUserContact);

export default router;