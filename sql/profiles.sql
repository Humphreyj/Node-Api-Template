INSERT INTO `profiles` (
  `first_name`,
  `last_name`,
  `email`,
  `phone`,
  `address_line_1`,
  `address_line_2`,
  `city`,
  `state`,
  `zip`,
  `title`
) VALUES
('Tony', 'Balogna', 'johndoe@example.com', '555-1234', '123 Main St', 'Apt 4B', 'Anytown', 'CA', '90210', 'Manager');


INSERT INTO `accounts` (
  `primaryContact`,
  `companyName`,
  `companyAddress`,
  `companyPhone`,
  `companyEmail`,
  `subscriptionPlan`,
  `billingInfo`
) VALUES
('1', 'Acme Corp', '{"address_line_1": "123 Main St", "address_line_2": "Apt 4B", "city": "Anytown", "state": "ca", "zip": "90210"}', '1', '{"card_number": "1234-5678-9012-3456", "expiration": "12/24", "cvv": "123"}');

