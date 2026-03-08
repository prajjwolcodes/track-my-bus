  const decoded = await adminAuth.verifyIdToken(token);
        const role = decoded.role as string;