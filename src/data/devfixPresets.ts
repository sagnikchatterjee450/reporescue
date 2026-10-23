export interface DevFixPreset {
  id: string;
  name: string;
  language: string;
  errorCode: string;
  sampleCode: string;
  description: string;
}

export const SUPPORTED_LANGUAGES = [
  { id: 'typescript', name: 'TypeScript', ext: '.ts', icon: 'TS', popular: true },
  { id: 'javascript', name: 'JavaScript', ext: '.js', icon: 'JS', popular: true },
  { id: 'python', name: 'Python', ext: '.py', icon: 'PY', popular: true },
  { id: 'go', name: 'Go', ext: '.go', icon: 'GO', popular: true },
  { id: 'rust', name: 'Rust', ext: '.rs', icon: 'RS', popular: true },
  { id: 'java', name: 'Java', ext: '.java', icon: 'JV', popular: true },
  { id: 'cpp', name: 'C++', ext: '.cpp', icon: 'C++', popular: true },
  { id: 'csharp', name: 'C#', ext: '.cs', icon: 'C#', popular: false },
  { id: 'php', name: 'PHP', ext: '.php', icon: 'PHP', popular: false },
  { id: 'ruby', name: 'Ruby', ext: '.rb', icon: 'RB', popular: false },
  { id: 'sql', name: 'SQL', ext: '.sql', icon: 'SQL', popular: true },
  { id: 'bash', name: 'Shell / Bash', ext: '.sh', icon: 'SH', popular: false },
];

export const DEVFIX_PRESETS: DevFixPreset[] = [
  {
    id: 'ts-2322',
    name: "TS2322: Type 'string | null' is not assignable to type 'string'",
    language: 'typescript',
    errorCode: "TS2322: Type 'string | null' is not assignable to type 'string'",
    description: 'Strict null check violation when trying to assign a nullable value to a required string field.',
    sampleCode: `interface UserProfile {
  id: string;
  username: string;
  displayName: string;
}

function getStoredUser(): string | null {
  return localStorage.getItem('current_user');
}

export function buildProfile(id: string): UserProfile {
  const rawUser = getStoredUser();

  // Error occurs here: TS2322
  const profile: UserProfile = {
    id,
    username: rawUser,
    displayName: rawUser.toUpperCase()
  };

  return profile;
}`,
  },
  {
    id: 'js-typeerror-undefined',
    name: "TypeError: Cannot read properties of undefined (reading 'map')",
    language: 'javascript',
    errorCode: "TypeError: Cannot read properties of undefined (reading 'map')",
    description: 'Attempting to iterate over a property before asynchronous API fetch resolves or when payload format is missing items.',
    sampleCode: `async function renderRepositoryIssues() {
  const response = await fetch('/api/issues');
  const payload = await response.json();

  // Error occurs here if payload.data is undefined
  const issueTitles = payload.data.items.map(item => {
    return \`#\${item.id}: \${item.title}\`;
  });

  console.log("Loaded issues:", issueTitles);
  return issueTitles;
}`,
  },
  {
    id: 'py-indexerror',
    name: 'IndexError: list index out of range',
    language: 'python',
    errorCode: 'IndexError: list index out of range',
    description: 'Accessing an element at an index beyond the boundaries of a list, often caused by off-by-one errors or empty collections.',
    sampleCode: `def calculate_trailing_moving_averages(data_points, window_size=5):
    averages = []
    
    # Off-by-one boundary error in the range limit:
    for i in range(len(data_points)):
        window = [data_points[i + offset] for offset in range(window_size)]
        avg = sum(window) / len(window)
        averages.append(avg)
        
    return averages

prices = [102.4, 105.1, 103.8, 108.2, 110.0]
# Fails when i approaches end of prices list:
result = calculate_trailing_moving_averages(prices, 5)
print(result)`,
  },
  {
    id: 'py-keyerror',
    name: "KeyError: 'auth_token'",
    language: 'python',
    errorCode: "KeyError: 'auth_token'",
    description: 'Directly indexing a dictionary with square brackets for a key that does not exist in request headers or configuration.',
    sampleCode: `def extract_session_credentials(headers_dict):
    # Fails if client did not supply the exact key 'auth_token'
    raw_token = headers_dict['auth_token']
    client_role = headers_dict['x-user-role']
    
    return {
        "token": raw_token.strip(),
        "is_admin": client_role.lower() == "admin"
    }

incoming_request = {
    "authorization": "Bearer eyJhbGciOi...",
    "content-type": "application/json"
}

credentials = extract_session_credentials(incoming_request)`,
  },
  {
    id: 'rust-e0382',
    name: 'E0382: borrow of moved value',
    language: 'rust',
    errorCode: "error[E0382]: borrow of moved value: `user_name`",
    description: 'Using a non-Copy variable after ownership has already been transferred to another function or closure.',
    sampleCode: `struct Auditor;

impl Auditor {
    fn log_activity(&self, name: String) {
        println!("Audit log for: {}", name);
    }
}

fn register_user(user_name: String) {
    let auditor = Auditor;
    
    // Ownership of 'user_name' is moved here
    auditor.log_activity(user_name);

    // Error[E0382]: borrow of moved value: 'user_name'
    println!("Successfully registered: {}", user_name);
}

fn main() {
    register_user(String::from("dev_alex"));
}`,
  },
  {
    id: 'go-nil-pointer',
    name: 'panic: runtime error: invalid memory address or nil pointer dereference',
    language: 'go',
    errorCode: 'panic: runtime error: invalid memory address or nil pointer dereference',
    description: 'Attempting to access a field or method on a pointer struct that was never initialized or returned as nil.',
    sampleCode: `package main

import (
	"fmt"
)

type DatabaseConfig struct {
	Host string
	Port int
}

type Client struct {
	Config *DatabaseConfig
}

func NewClient() *Client {
	// Notice Config is left uninitialized (nil)
	return &Client{}
}

func (c *Client) Connect() string {
	// Panics here because c.Config is nil!
	return fmt.Sprintf("Connecting to %s:%d", c.Config.Host, c.Config.Port)
}

func main() {
	client := NewClient()
	fmt.Println(client.Connect())
}`,
  },
  {
    id: 'java-npe',
    name: 'java.lang.NullPointerException: Cannot invoke method on null object',
    language: 'java',
    errorCode: 'java.lang.NullPointerException: Cannot invoke "String.trim()" because the return value of "Customer.getEmail()" is null',
    description: 'Invoking methods on an uninitialized or optional reference without null-safety checks or Optional wrapping.',
    sampleCode: `public class CustomerService {
    public static class Customer {
        private String name;
        private String email;

        public String getEmail() { return this.email; }
    }

    public void processNotification(Customer customer) {
        // Throws NullPointerException if customer or getEmail() returns null:
        String cleanedEmail = customer.getEmail().trim().toLowerCase();
        
        System.out.println("Dispatching receipt to: " + cleanedEmail);
    }
}`,
  },
  {
    id: 'cpp-segfault',
    name: 'Segmentation fault (core dumped) - Invalid Pointer Access',
    language: 'cpp',
    errorCode: 'Segmentation fault (core dumped): SIGSEGV 11',
    description: 'Dereferencing an unallocated pointer or accessing freed/out-of-bounds heap memory.',
    sampleCode: `#include <iostream>
#include <vector>

struct Node {
    int value;
    Node* next;
};

void appendNode(Node*& head, int val) {
    Node* current = head;
    // Fails with segfault when head is nullptr:
    while (current->next != nullptr) {
        current = current->next;
    }
    current->next = new Node{val, nullptr};
}

int main() {
    Node* listHead = nullptr; // Unallocated list
    appendNode(listHead, 42); // Crashes with SIGSEGV
    return 0;
}`,
  },
  {
    id: 'sql-1064',
    name: "ERROR 1064 (42000): Syntax error in SQL statement",
    language: 'sql',
    errorCode: "ERROR 1064 (42000): You have an error in your SQL syntax near 'WHERE status = 'active''",
    description: 'Incorrect clause ordering in SQL query (e.g., placing GROUP BY before WHERE or trailing commas in column list).',
    sampleCode: `SELECT 
    department_id,
    COUNT(employee_id) as total_staff,
    AVG(salary) as average_comp,
FROM employees
GROUP BY department_id
WHERE status = 'active'
HAVING average_comp > 75000
ORDER BY total_staff DESC;`,
  },
];
