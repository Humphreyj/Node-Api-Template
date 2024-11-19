export async function createProfile(req, res, next) {
  const { first_name, last_name, email, phone, address, role } = req.body;
  try {
    let full_name = `${first_name} ${last_name}`;
    await db.query(
      sql`INSERT INTO profiles (first_name, last_name, full_name, email, phone, address, role) 
            VALUES (${first_name}, ${last_name}, ${full_name}, ${email}, ${phone}, ${JSON.stringify(
        address
      )}, ${role})`
    );

    const result = await db.query(
      sql`SELECT id FROM profiles WHERE email = ${email} LIMIT 1`
    );
    const newProfileId = result[0].id;
    req.newProfile = {
      id: newProfileId,
      first_name: first_name,
      last_name: last_name,
      full_name: full_name,
      email: email,
      phone: phone,
      address: address,
      role: role,
    };
    next();
  } catch (error) {
    console.error("error", error);
    res.status(500).json({ success: false, message: "Error creating profile" });
  }
}
