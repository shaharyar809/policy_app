<?php
header("Content-Type: application/json");

// Database connection setup
try {
    $pdo = new PDO("mysql:host=localhost;dbname=policy_app", "root", "");
    // $pdo = new PDO("mysql:host=sql212.infinityfree.com;dbname=if0_37652260_policy_app", "if0_37652260", "57H276GDWg6");
    $pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
} catch (PDOException $e) {
    exitWithError("Database connection failed");
}

// Route requests based on method and action
$method = $_SERVER['REQUEST_METHOD'];
$action = $_GET['action'] ?? null;

if ($method === 'POST' && $action === 'add') {
    addUser($pdo);
} elseif ($method === 'GET') {
    getUsersByPhoneOrCnic($pdo, $_GET['phone_number'] ?? null, $_GET['cnic'] ?? null);
} else {
    exitWithError("Invalid request");
}

// Functions for handling different operations

function addUser($pdo) {
    $data = json_decode(file_get_contents("php://input"), true);

    if (!isset($data['fullname'], $data['cnic'], $data['phone_number'], $data['policy_number'], $data['dob'])) {
        exitWithError("Missing required fields");
    }

    $stmt = $pdo->prepare("INSERT INTO users (fullname, cnic, phone_number, policy_number, dob) VALUES (?, ?, ?, ?, ?)");
    if ($stmt->execute([$data['fullname'], $data['cnic'], $data['phone_number'], $data['policy_number'], $data['dob']])) {
        echo json_encode(["status" => "success", "message" => "User added successfully", "user_id" => $pdo->lastInsertId()]);
    } else {
        exitWithError("Failed to add user");
    }
}

function getUsersByPhoneOrCnic($pdo, $phoneNumber, $cnic) {
    $query = "SELECT id, fullname, cnic, phone_number, policy_number, dob FROM users WHERE ";
    $params = [];

    if ($phoneNumber && $cnic) {
        $query .= "phone_number = ? AND cnic = ?";
        $params = [$phoneNumber, $cnic];
    } elseif ($phoneNumber) {
        $query .= "phone_number = ?";
        $params = [$phoneNumber];
    } elseif ($cnic) {
        $query .= "cnic = ?";
        $params = [$cnic];
    } else {
        exitWithError("Phone number or CNIC required");
    }

    $stmt = $pdo->prepare($query);
    $stmt->execute($params);
    $users = $stmt->fetchAll(PDO::FETCH_ASSOC);

    if ($users) {
        echo json_encode(["status" => "success", "users" => $users]);
    } else {
        exitWithError("No users found");
    }
}

// Helper function for error responses
function exitWithError($message) {
    echo json_encode(["status" => "error", "message" => $message]);
    exit();
}
?>
