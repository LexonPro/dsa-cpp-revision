/**
 * DSA Tree Structure — Defines the tree topology, node metadata,
 * and spatial layout hints for the interactive canvas tree.
 */

export const BRANCH_COLORS = {
  linear: '#3b82f6',      // Blue
  nonlinear: '#8b5cf6',   // Violet
  algorithms: '#10b981',  // Emerald
  advanced: '#f59e0b',    // Amber
};

export const DIFFICULTY = {
  EASY: { label: 'Easy', color: '#10b981', bg: 'rgba(16,185,129,0.15)' },
  MEDIUM: { label: 'Medium', color: '#f59e0b', bg: 'rgba(245,158,11,0.15)' },
  HARD: { label: 'Hard', color: '#f43f5e', bg: 'rgba(244,63,94,0.15)' },
};

export const treeData = {
  root: {
    id: 'root',
    label: 'Core Foundations & STL',
    sublabel: 'C++ Vectors · Memory · Complexity',
    color: '#3b82f6',
  },

  branches: [
    {
      id: 'linear',
      label: 'Linear Data Structures',
      color: BRANCH_COLORS.linear,
      leaves: ['arrays', 'stacks-queues', 'linked-lists'],
    },
    {
      id: 'nonlinear',
      label: 'Non-Linear Structures',
      color: BRANCH_COLORS.nonlinear,
      leaves: ['trees-bsts', 'graphs', 'heaps', 'tries'],
    },
    {
      id: 'algorithms',
      label: 'Algorithms & Optimization',
      color: BRANCH_COLORS.algorithms,
      leaves: ['searching-sorting', 'dynamic-programming'],
    },
    {
      id: 'advanced',
      label: 'Advanced Topics',
      color: BRANCH_COLORS.advanced,
      leaves: ['greedy-bit'],
    },
  ],
};

export const leafNodes = {
  'arrays': {
    id: 'arrays',
    label: 'Arrays & Strings',
    icon: '📊',
    difficulty: DIFFICULTY.EASY,
    branch: 'linear',
    introduction: 'Arrays are contiguous memory blocks — the building block of nearly every data structure. Strings in C++ are essentially character arrays with rich STL support.',
    subtopics: [
      'Two Pointer Technique',
      'Sliding Window (Fixed & Variable)',
      'Prefix Sum & Difference Arrays',
      'Kadane\'s Algorithm',
      'Hashing & Frequency Maps',
      'Dutch National Flag',
      'Binary Search on Answer',
    ],
    problems: [
      { name: 'Two Sum', difficulty: 'Easy', pattern: 'Hashing' },
      { name: 'Trapping Rain Water', difficulty: 'Hard', pattern: 'Two Pointer' },
      { name: 'Longest Substring Without Repeating', difficulty: 'Medium', pattern: 'Sliding Window' },
      { name: 'Maximum Subarray', difficulty: 'Medium', pattern: 'Kadane\'s' },
      { name: 'Sort Colors', difficulty: 'Medium', pattern: 'Dutch National Flag' },
    ],
  },

  'searching-sorting': {
    id: 'searching-sorting',
    label: 'Searching & Sorting',
    icon: '🔍',
    difficulty: DIFFICULTY.EASY,
    branch: 'algorithms',
    introduction: 'Searching and sorting are fundamental operations. Master binary search patterns and understand when to apply which sorting algorithm for optimal performance.',
    subtopics: [
      'Binary Search (Classic & Variants)',
      'Search in Rotated Array',
      'Merge Sort & Inversions',
      'Quick Sort & Partitioning',
      'Counting Sort / Radix Sort',
      'Order Statistics (Kth Element)',
    ],
    problems: [
      { name: 'Binary Search', difficulty: 'Easy', pattern: 'Binary Search' },
      { name: 'Search in Rotated Sorted Array', difficulty: 'Medium', pattern: 'Modified Binary Search' },
      { name: 'Merge Intervals', difficulty: 'Medium', pattern: 'Sort + Sweep' },
      { name: 'Kth Largest Element', difficulty: 'Medium', pattern: 'Quick Select' },
      { name: 'Median of Two Sorted Arrays', difficulty: 'Hard', pattern: 'Binary Search' },
    ],
  },

  'stacks-queues': {
    id: 'stacks-queues',
    label: 'Stacks & Queues',
    icon: '📚',
    difficulty: DIFFICULTY.MEDIUM,
    branch: 'linear',
    introduction: 'LIFO and FIFO structures that power expression evaluation, BFS, and monotonic patterns. The monotonic stack is a must-know interview pattern.',
    subtopics: [
      'Stack Fundamentals (Push/Pop/Peek)',
      'Monotonic Stack Pattern',
      'Next Greater Element',
      'Queue using Stacks & Vice Versa',
      'Deque & Sliding Window Maximum',
      'Expression Evaluation (Infix/Postfix)',
    ],
    problems: [
      { name: 'Valid Parentheses', difficulty: 'Easy', pattern: 'Stack' },
      { name: 'Next Greater Element', difficulty: 'Medium', pattern: 'Monotonic Stack' },
      { name: 'Largest Rectangle in Histogram', difficulty: 'Hard', pattern: 'Monotonic Stack' },
      { name: 'Sliding Window Maximum', difficulty: 'Hard', pattern: 'Deque' },
      { name: 'Min Stack', difficulty: 'Medium', pattern: 'Design' },
    ],
  },

  'linked-lists': {
    id: 'linked-lists',
    label: 'Linked Lists',
    icon: '🔗',
    difficulty: DIFFICULTY.MEDIUM,
    branch: 'linear',
    introduction: 'Dynamic node-based structures with O(1) insertion. Master the fast-slow pointer technique and in-place reversal patterns used heavily in interviews.',
    subtopics: [
      'Singly & Doubly Linked Lists',
      'Fast-Slow Pointer (Cycle Detection)',
      'In-place Reversal',
      'Merge Two Sorted Lists',
      'LRU Cache Design',
      'Flattening a Multilevel List',
    ],
    problems: [
      { name: 'Reverse Linked List', difficulty: 'Easy', pattern: 'Reversal' },
      { name: 'Linked List Cycle', difficulty: 'Easy', pattern: 'Fast-Slow' },
      { name: 'Merge K Sorted Lists', difficulty: 'Hard', pattern: 'Heap + Merge' },
      { name: 'LRU Cache', difficulty: 'Medium', pattern: 'Design' },
      { name: 'Reorder List', difficulty: 'Medium', pattern: 'Fast-Slow + Reversal' },
    ],
  },

  'trees-bsts': {
    id: 'trees-bsts',
    label: 'Trees & BSTs',
    icon: '🌲',
    difficulty: DIFFICULTY.MEDIUM,
    branch: 'nonlinear',
    introduction: 'Hierarchical structures central to databases, file systems, and compilers. DFS and BFS traversals are building blocks for nearly every tree problem.',
    subtopics: [
      'DFS: Inorder, Preorder, Postorder',
      'BFS / Level Order Traversal',
      'BST Operations (Insert/Delete/Search)',
      'Lowest Common Ancestor',
      'Diameter & Height of Tree',
      'Serialization & Deserialization',
      'Segment Trees & BIT (Intro)',
    ],
    problems: [
      { name: 'Invert Binary Tree', difficulty: 'Easy', pattern: 'DFS' },
      { name: 'Validate BST', difficulty: 'Medium', pattern: 'Inorder' },
      { name: 'Lowest Common Ancestor', difficulty: 'Medium', pattern: 'DFS' },
      { name: 'Binary Tree Maximum Path Sum', difficulty: 'Hard', pattern: 'DFS' },
      { name: 'Serialize/Deserialize Tree', difficulty: 'Hard', pattern: 'BFS/DFS' },
    ],
  },

  'graphs': {
    id: 'graphs',
    label: 'Graphs',
    icon: '🕸️',
    difficulty: DIFFICULTY.HARD,
    branch: 'nonlinear',
    introduction: 'Networks of nodes and edges modeling real-world connections. Graph algorithms like Dijkstra, BFS/DFS, and Union-Find are essential for competitive programming and system design.',
    subtopics: [
      'BFS & DFS Traversals',
      'Topological Sort (Kahn\'s / DFS)',
      'Dijkstra\'s Shortest Path',
      'Bellman-Ford & Negative Cycles',
      'Union-Find (Disjoint Set)',
      'Minimum Spanning Tree (Prim/Kruskal)',
      'Cycle Detection (Directed/Undirected)',
    ],
    problems: [
      { name: 'Number of Islands', difficulty: 'Medium', pattern: 'BFS/DFS' },
      { name: 'Course Schedule', difficulty: 'Medium', pattern: 'Topological Sort' },
      { name: 'Dijkstra\'s Shortest Path', difficulty: 'Medium', pattern: 'Greedy + Heap' },
      { name: 'Network Delay Time', difficulty: 'Medium', pattern: 'Dijkstra' },
      { name: 'Alien Dictionary', difficulty: 'Hard', pattern: 'Topological Sort' },
    ],
  },

  'heaps': {
    id: 'heaps',
    label: 'Heaps',
    icon: '⛰️',
    difficulty: DIFFICULTY.MEDIUM,
    branch: 'nonlinear',
    introduction: 'Priority queues backed by complete binary trees. Essential for scheduling, median finding, and merging K sorted structures efficiently.',
    subtopics: [
      'Min-Heap & Max-Heap',
      'Heap Operations (Insert/Extract)',
      'Priority Queue in C++ STL',
      'Top K Elements Pattern',
      'Merge K Sorted Lists/Arrays',
      'Median from Data Stream',
    ],
    problems: [
      { name: 'Kth Largest Element', difficulty: 'Medium', pattern: 'Min Heap' },
      { name: 'Top K Frequent Elements', difficulty: 'Medium', pattern: 'Heap + Hash' },
      { name: 'Find Median from Stream', difficulty: 'Hard', pattern: 'Two Heaps' },
      { name: 'Merge K Sorted Lists', difficulty: 'Hard', pattern: 'Min Heap' },
      { name: 'Task Scheduler', difficulty: 'Medium', pattern: 'Max Heap + Greedy' },
    ],
  },

  'dynamic-programming': {
    id: 'dynamic-programming',
    label: 'Dynamic Programming',
    icon: '🧮',
    difficulty: DIFFICULTY.HARD,
    branch: 'algorithms',
    introduction: 'The art of breaking problems into overlapping subproblems. DP is the single most tested topic in coding interviews — master the patterns, not just the problems.',
    subtopics: [
      '1D DP (Fibonacci, Climbing Stairs)',
      '2D DP (Grid Paths, LCS)',
      'Knapsack Variants (0/1, Unbounded)',
      'Interval DP (Matrix Chain)',
      'DP on Trees',
      'Bitmask DP',
      'State Machine DP (Stock Problems)',
    ],
    problems: [
      { name: 'Climbing Stairs', difficulty: 'Easy', pattern: '1D DP' },
      { name: 'Longest Common Subsequence', difficulty: 'Medium', pattern: '2D DP' },
      { name: '0/1 Knapsack', difficulty: 'Medium', pattern: 'Knapsack' },
      { name: 'Edit Distance', difficulty: 'Medium', pattern: '2D DP' },
      { name: 'Burst Balloons', difficulty: 'Hard', pattern: 'Interval DP' },
    ],
  },

  'tries': {
    id: 'tries',
    label: 'Tries',
    icon: '🔤',
    difficulty: DIFFICULTY.MEDIUM,
    branch: 'nonlinear',
    introduction: 'Prefix trees for efficient string operations. Essential for autocomplete, spell checking, and word search problems.',
    subtopics: [
      'Trie Construction (Insert/Search)',
      'Prefix Matching',
      'Word Search in Grid',
      'Auto-Complete Systems',
      'XOR Trie (Max XOR Pair)',
    ],
    problems: [
      { name: 'Implement Trie', difficulty: 'Medium', pattern: 'Design' },
      { name: 'Word Search II', difficulty: 'Hard', pattern: 'Trie + Backtracking' },
      { name: 'Design Autocomplete', difficulty: 'Hard', pattern: 'Trie + DFS' },
      { name: 'Maximum XOR', difficulty: 'Medium', pattern: 'XOR Trie' },
      { name: 'Replace Words', difficulty: 'Medium', pattern: 'Trie' },
    ],
  },

  'greedy-bit': {
    id: 'greedy-bit',
    label: 'Greedy & Bit Manipulation',
    icon: '⚡',
    difficulty: DIFFICULTY.MEDIUM,
    branch: 'advanced',
    introduction: 'Greedy makes locally optimal choices; bit manipulation exploits binary representations for O(1) tricks. Both are interview favorites for their elegant solutions.',
    subtopics: [
      'Activity Selection / Interval Scheduling',
      'Huffman Coding Concept',
      'Fractional Knapsack',
      'Bitwise AND/OR/XOR Tricks',
      'Power of Two / Count Set Bits',
      'Single Number (XOR Pattern)',
      'Subset Generation with Bitmasks',
    ],
    problems: [
      { name: 'Jump Game', difficulty: 'Medium', pattern: 'Greedy' },
      { name: 'Non-overlapping Intervals', difficulty: 'Medium', pattern: 'Greedy + Sort' },
      { name: 'Single Number', difficulty: 'Easy', pattern: 'XOR' },
      { name: 'Counting Bits', difficulty: 'Easy', pattern: 'Bit DP' },
      { name: 'Minimum Number of Arrows', difficulty: 'Medium', pattern: 'Greedy' },
    ],
  },
};

/** Flat list of all leaf IDs for iteration */
export const allLeafIds = Object.keys(leafNodes);

/** Root node content for the drawer */
export const rootContent = {
  title: 'Core Foundations & STL',
  sections: [
    {
      heading: 'C++ STL Vectors',
      items: [
        'Dynamic arrays with automatic resizing',
        'push_back(), pop_back(), size(), capacity()',
        'Reserve vs Resize — when to use each',
        'Iterators: begin(), end(), rbegin()',
        '2D vectors: vector<vector<int>>',
      ],
    },
    {
      heading: 'Time & Space Complexity',
      items: [
        'Big-O, Big-Ω, Big-Θ notation',
        'Common complexities: O(1) → O(n!) ',
        'Amortized analysis (vector push_back)',
        'Space complexity vs auxiliary space',
        'Recurrence relations (Master Theorem)',
      ],
    },
    {
      heading: 'Pointer & Memory Basics',
      items: [
        'Stack vs Heap allocation',
        'Pointers, references, and smart pointers',
        'Memory leaks & dangling pointers',
        'new/delete vs malloc/free',
        'RAII pattern in C++',
      ],
    },
    {
      heading: 'Essential STL Toolkit',
      items: [
        'sort(), binary_search(), lower_bound()',
        'unordered_map, unordered_set',
        'priority_queue, stack, queue, deque',
        'Pair, tuple, and structured bindings',
        'Lambda expressions with STL algorithms',
      ],
    },
  ],
};
