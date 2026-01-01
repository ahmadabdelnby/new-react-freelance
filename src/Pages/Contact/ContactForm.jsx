import React, { useState } from "react";
import styles from "./ContactForm.module.css";
import { toast } from "react-toastify";
import { apiPost } from "../../Services/apiHelper";

const ContactForm = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    company: "",
    role: "",
    phone: "",
    country: "",
    linkedin: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const response = await apiPost('/contacts', formData);
      
      if (response.success) {
        toast.success(response.message || "Thank you for contacting us!");
        // Reset form
        setFormData({
          fullName: "",
          email: "",
          company: "",
          role: "",
          phone: "",
          country: "",
          linkedin: "",
        });
      }
    } catch (error) {
      console.error('Error submitting contact form:', error);
      toast.error(error.message || "Failed to submit form. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Contact Us</h2>

      <label>Full Name</label>
      <input
        type="text"
        name="fullName"
        placeholder="e.g., Maria López"
        value={formData.fullName}
        onChange={handleChange}
        required
      />

      <label>Work Email</label>
      <input
        type="email"
        name="email"
        placeholder="e.g., maria@company.com"
        value={formData.email}
        onChange={handleChange}
        required
      />

      <label>Company Name</label>
      <input
        type="text"
        name="company"
        placeholder="e.g., Lifted Solutions"
        value={formData.company}
        onChange={handleChange}
        required
      />

      <label>Job Title / Role</label>
      <input
        type="text"
        name="role"
        placeholder="e.g., Founder"
        value={formData.role}
        onChange={handleChange}
        required
      />

      <label>Phone Number</label>
      <input
        type="tel"
        name="phone"
        placeholder="(XXX) XXX-XXXX"
        value={formData.phone}
        onChange={handleChange}
        required
      />

      <label>Country</label>
      <input
        type="text"
        name="country"
        placeholder="e.g., United States"
        value={formData.country}
        onChange={handleChange}
        required
      />

      <label>LinkedIn Profile (optional)</label>
      <input
        type="text"
        name="linkedin"
        placeholder="https://www.linkedin.com/in/..."
        value={formData.linkedin}
        onChange={handleChange}
      />

      <button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Submitting..." : "Submit"}
      </button>
    </form>
  );
};

export default ContactForm;
