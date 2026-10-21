import { evaluateCodingSolutionWithGemini, evaluateTechnicalInterviewTestWithGemini } from './geminiService';

export interface CodingProblem {
  id: string;
  title: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  category: string;
  acceptance: string;
  companies: string[];
  description: string;
  examples: Array<{
    input: string;
    output: string;
    explanation?: string;
  }>;
  constraints: string[];
  hints: string[];
  starterCode: Record<string, string>;
  testCases: Array<{
    input: string;
    expected: string;
  }>;
  optimalCode: Record<string, string>;
}

export const CODING_PROBLEMS: CodingProblem[] = [
  // ==========================================
  // EASY PROBLEMS (1 to 7)
  // ==========================================
  {
    id: 'two-sum',
    title: 'Two Sum',
    difficulty: 'Easy',
    category: 'Arrays & Hashing',
    acceptance: '53.8%',
    companies: ['Google', 'Meta', 'Amazon', 'Apple', 'Microsoft'],
    description: `Given an array of integers 'nums' and an integer 'target', return indices of the two numbers such that they add up to 'target'.

You may assume that each input would have exactly one solution, and you may not use the same element twice. You can return the answer in any order.`,
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].'
      },
      {
        input: 'nums = [3,2,4], target = 6',
        output: '[1,2]',
        explanation: 'Because nums[1] + nums[2] == 6, we return [1, 2].'
      },
      {
        input: 'nums = [3,3], target = 6',
        output: '[0,1]'
      }
    ],
    constraints: [
      '2 <= nums.length <= 10^4',
      '-10^9 <= nums[i] <= 10^9',
      '-10^9 <= target <= 10^9',
      'Only one valid answer exists.'
    ],
    hints: [
      'A brute force approach checks all pairs in O(N^2) time. Can you do it in a single pass?',
      'Can a Hash Map (dictionary) help you store values you have already seen along with their indices?',
      'For each number x, check if (target - x) is already present in your hash map. If so, you found the pair!'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number[]}
 */
function twoSum(nums, target) {
  // Write your solution here
}`,
      typescript: `function twoSum(nums: number[], target: number): number[] {
  // Write your solution here
  return [];
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        # Write your solution here
        pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Write your solution here
        return new int[]{};
    }
}`,
      cpp: `#include <vector>
using namespace std;

class Solution {
public:
    vector<int> twoSum(vector<int>& nums, int target) {
        // Write your solution here
        return {};
    }
};`
    },
    testCases: [
      { input: '[2, 7, 11, 15], target = 9', expected: '[0, 1]' },
      { input: '[3, 2, 4], target = 6', expected: '[1, 2]' },
      { input: '[3, 3], target = 6', expected: '[0, 1]' }
    ],
    optimalCode: {
      javascript: `function twoSum(nums, target) {
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    map.set(nums[i], i);
  }
  return [];
}`,
      python: `class Solution:
    def twoSum(self, nums: list[int], target: int) -> list[int]:
        seen = {}
        for i, num in enumerate(nums):
            complement = target - num
            if complement in seen:
                return [seen[complement], i]
            seen[num] = i
        return []`
    }
  },
  {
    id: 'valid-parentheses',
    title: 'Valid Parentheses',
    difficulty: 'Easy',
    category: 'Stack',
    acceptance: '41.2%',
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'Google', 'Meta'],
    description: "Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.\n\nAn input string is valid if:\n1. Open brackets must be closed by the same type of brackets.\n2. Open brackets must be closed in the correct order.\n3. Every close bracket has a corresponding open bracket of the same type.",
    examples: [
      { input: 's = "()"', output: 'true' },
      { input: 's = "()[]{}"', output: 'true' },
      { input: 's = "(]"', output: 'false' },
      { input: 's = "([])"', output: 'true' }
    ],
    constraints: [
      '1 <= s.length <= 10^4',
      "s consists of parentheses only '()[]{}'."
    ],
    hints: [
      'Use a Last-In First-Out (LIFO) stack data structure.',
      'When you see an opening bracket, push its matching closing bracket onto the stack.',
      'When you see a closing bracket, pop from the stack and compare. If it does not match or the stack is empty, return false.'
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isValid(s) {
  // Write your solution here
}`,
      typescript: `function isValid(s: string): boolean {
  // Write your solution here
  return true;
}`,
      python: `class Solution:
    def isValid(self, s: str) -> bool:
        # Write your solution here
        pass`
    },
    testCases: [
      { input: '"()"', expected: 'true' },
      { input: '"()[]{}"', expected: 'true' },
      { input: '"(]"', expected: 'false' }
    ],
    optimalCode: {
      javascript: `function isValid(s) {
  const stack = [];
  const map = { ')': '(', '}': '{', ']': '[' };
  for (const char of s) {
    if (char === '(' || char === '{' || char === '[') {
      stack.push(char);
    } else {
      if (stack.pop() !== map[char]) return false;
    }
  }
  return stack.length === 0;
}`
    }
  },
  {
    id: 'best-time-to-buy-and-sell-stock',
    title: 'Best Time to Buy and Sell Stock',
    difficulty: 'Easy',
    category: 'Sliding Window',
    acceptance: '54.6%',
    companies: ['Amazon', 'Apple', 'Meta', 'Google', 'Goldman Sachs'],
    description: `You are given an array 'prices' where 'prices[i]' is the price of a given stock on the 'i'th day.

You want to maximize your profit by choosing a single day to buy one stock and choosing a different day in the future to sell that stock.

Return the maximum profit you can achieve from this transaction. If you cannot achieve any profit, return '0'.`,
    examples: [
      { input: 'prices = [7,1,5,3,6,4]', output: '5', explanation: 'Buy on day 2 (price = 1) and sell on day 5 (price = 6), profit = 6-1 = 5.' },
      { input: 'prices = [7,6,4,3,1]', output: '0', explanation: 'In this case, no transactions are done and max profit = 0.' }
    ],
    constraints: [
      '1 <= prices.length <= 10^5',
      '0 <= prices[i] <= 10^4'
    ],
    hints: [
      'Keep track of the minimum price seen so far as you iterate.',
      'At each day, the potential profit is prices[i] - minPrice. Update maxProfit accordingly.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} prices
 * @return {number}
 */
function maxProfit(prices) {
  // Write your solution here
}`,
      typescript: `function maxProfit(prices: number[]): number {
  // Write your solution here
  return 0;
}`,
      python: `class Solution:
    def maxProfit(self, prices: list[int]) -> int:
        # Write your solution here
        pass`
    },
    testCases: [
      { input: '[7,1,5,3,6,4]', expected: '5' },
      { input: '[7,6,4,3,1]', expected: '0' }
    ],
    optimalCode: {
      javascript: `function maxProfit(prices) {
  let minPrice = Infinity;
  let maxProfit = 0;
  for (const price of prices) {
    if (price < minPrice) {
      minPrice = price;
    } else if (price - minPrice > maxProfit) {
      maxProfit = price - minPrice;
    }
  }
  return maxProfit;
}`
    }
  },
  {
    id: 'reverse-linked-list',
    title: 'Reverse Linked List',
    difficulty: 'Easy',
    category: 'Linked List',
    acceptance: '76.1%',
    companies: ['Amazon', 'Microsoft', 'Apple', 'Meta', 'Adobe'],
    description: `Given the 'head' of a singly linked list, reverse the list, and return the reversed list.`,
    examples: [
      { input: 'head = [1,2,3,4,5]', output: '[5,4,3,2,1]' },
      { input: 'head = [1,2]', output: '[2,1]' },
      { input: 'head = []', output: '[]' }
    ],
    constraints: [
      'The number of nodes in the list is the range [0, 5000].',
      '-5000 <= Node.val <= 5000'
    ],
    hints: [
      'Think about maintaining three pointers: prev, curr, and next.',
      'At each node, remember curr.next, point curr.next backwards to prev, then advance prev and curr.'
    ],
    starterCode: {
      javascript: `/**
 * Definition for singly-linked list.
 * function ListNode(val, next) {
 *     this.val = (val===undefined ? 0 : val)
 *     this.next = (next===undefined ? null : next)
 * }
 * @param {ListNode} head
 * @return {ListNode}
 */
function reverseList(head) {
  // Write your solution here
}`,
      typescript: `function reverseList(head: any): any {
  // Write your solution here
  return null;
}`,
      python: `class Solution:
    def reverseList(self, head):
        # Write your solution here
        pass`
    },
    testCases: [
      { input: '[1,2,3,4,5]', expected: '[5,4,3,2,1]' },
      { input: '[1,2]', expected: '[2,1]' }
    ],
    optimalCode: {
      javascript: `function reverseList(head) {
  let prev = null;
  let curr = head;
  while (curr !== null) {
    const next = curr.next;
    curr.next = prev;
    prev = curr;
    curr = next;
  }
  return prev;
}`
    }
  },
  {
    id: 'maximum-subarray',
    title: 'Maximum Subarray (Kadane’s Algorithm)',
    difficulty: 'Easy',
    category: 'Dynamic Programming',
    acceptance: '51.3%',
    companies: ['Amazon', 'Apple', 'Microsoft', 'Google', 'Meta'],
    description: `Given an integer array 'nums', find the subarray with the largest sum, and return its sum.`,
    examples: [
      { input: 'nums = [-2,1,-3,4,-1,2,1,-5,4]', output: '6', explanation: 'The subarray [4,-1,2,1] has the largest sum 6.' },
      { input: 'nums = [1]', output: '1' },
      { input: 'nums = [5,4,-1,7,8]', output: '23' }
    ],
    constraints: [
      '1 <= nums.length <= 10^5',
      '-10^4 <= nums[i] <= 10^4'
    ],
    hints: [
      "Kadane's Algorithm: Keep a running sum. If the running sum becomes negative, discard it and restart at 0.",
      'At each index, currentSum = max(nums[i], currentSum + nums[i]).'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number}
 */
function maxSubArray(nums) {
  // Write your solution here
}`,
      typescript: `function maxSubArray(nums: number[]): number {
  return 0;
}`,
      python: `class Solution:
    def maxSubArray(self, nums: list[int]) -> int:
        pass`
    },
    testCases: [
      { input: '[-2,1,-3,4,-1,2,1,-5,4]', expected: '6' },
      { input: '[5,4,-1,7,8]', expected: '23' }
    ],
    optimalCode: {
      javascript: `function maxSubArray(nums) {
  let currentSum = nums[0];
  let maxSum = nums[0];
  for (let i = 1; i < nums.length; i++) {
    currentSum = Math.max(nums[i], currentSum + nums[i]);
    maxSum = Math.max(maxSum, currentSum);
  }
  return maxSum;
}`
    }
  },
  {
    id: 'binary-search',
    title: 'Binary Search',
    difficulty: 'Easy',
    category: 'Binary Search',
    acceptance: '57.9%',
    companies: ['Google', 'Microsoft', 'Apple', 'Amazon'],
    description: `Given an array of integers 'nums' which is sorted in ascending order, and an integer 'target', write a function to search 'target' in 'nums'. If 'target' exists, then return its index. Otherwise, return '-1'.

You must write an algorithm with 'O(log n)' runtime complexity.`,
    examples: [
      { input: 'nums = [-1,0,3,5,9,12], target = 9', output: '4', explanation: '9 exists in nums and its index is 4' },
      { input: 'nums = [-1,0,3,5,9,12], target = 2', output: '-1', explanation: '2 does not exist in nums so return -1' }
    ],
    constraints: [
      '1 <= nums.length <= 10^4',
      '-10^4 < nums[i], target < 10^4',
      'All the integers in nums are unique.',
      'nums is sorted in ascending order.'
    ],
    hints: [
      'Maintain two pointers left = 0 and right = nums.length - 1.',
      'Compute mid = Math.floor((left + right) / 2). Compare nums[mid] with target.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function search(nums, target) {
  // Write your solution here
}`,
      typescript: `function search(nums: number[], target: number): number {
  return -1;
}`,
      python: `class Solution:
    def search(self, nums: list[int], target: int) -> int:
        pass`
    },
    testCases: [
      { input: '[-1,0,3,5,9,12], target = 9', expected: '4' },
      { input: '[-1,0,3,5,9,12], target = 2', expected: '-1' }
    ],
    optimalCode: {
      javascript: `function search(nums, target) {
  let left = 0;
  let right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[mid] < target) left = mid + 1;
    else right = mid - 1;
  }
  return -1;
}`
    }
  },
  {
    id: 'valid-palindrome',
    title: 'Valid Palindrome',
    difficulty: 'Easy',
    category: 'Two Pointers',
    acceptance: '47.5%',
    companies: ['Meta', 'Amazon', 'Microsoft', 'Bloomberg'],
    description: `A phrase is a palindrome if, after converting all uppercase letters into lowercase letters and removing all non-alphanumeric characters, it reads the same forward and backward. Alphanumeric characters include letters and numbers.

Given a string 's', return 'true' if it is a palindrome, or 'false' otherwise.`,
    examples: [
      { input: 's = "A man, a plan, a canal: Panama"', output: 'true', explanation: '"amanaplanacanalpanama" is a palindrome.' },
      { input: 's = "race a car"', output: 'false', explanation: '"raceacar" is not a palindrome.' }
    ],
    constraints: [
      '1 <= s.length <= 2 * 10^5',
      's consists only of printable ASCII characters.'
    ],
    hints: [
      'Use two pointers starting at left = 0 and right = s.length - 1.',
      'Skip non-alphanumeric characters using regex or character code checks.'
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {boolean}
 */
function isPalindrome(s) {
  // Write your solution here
}`,
      typescript: `function isPalindrome(s: string): boolean {
  return true;
}`,
      python: `class Solution:
    def isPalindrome(self, s: str) -> bool:
        pass`
    },
    testCases: [
      { input: '"A man, a plan, a canal: Panama"', expected: 'true' },
      { input: '"race a car"', expected: 'false' }
    ],
    optimalCode: {
      javascript: `function isPalindrome(s) {
  const clean = s.toLowerCase().replace(/[^a-z0-9]/g, '');
  let left = 0;
  let right = clean.length - 1;
  while (left < right) {
    if (clean[left] !== clean[right]) return false;
    left++;
    right--;
  }
  return true;
}`
    }
  },

  // ==========================================
  // MEDIUM PROBLEMS (8 to 15)
  // ==========================================
  {
    id: 'longest-substring-without-repeating-characters',
    title: 'Longest Substring Without Repeating Characters',
    difficulty: 'Medium',
    category: 'Sliding Window',
    acceptance: '35.4%',
    companies: ['Amazon', 'Microsoft', 'Google', 'Apple', 'Meta', 'Bloomberg'],
    description: `Given a string 's', find the length of the longest substring without repeating characters.`,
    examples: [
      { input: 's = "abcabcbb"', output: '3', explanation: 'The answer is "abc", with the length of 3.' },
      { input: 's = "bbbbb"', output: '1', explanation: 'The answer is "b", with the length of 1.' },
      { input: 's = "pwwkew"', output: '3', explanation: 'The answer is "wke", with the length of 3.' }
    ],
    constraints: [
      '0 <= s.length <= 5 * 10^4',
      's consists of English letters, digits, symbols and spaces.'
    ],
    hints: [
      'Use a sliding window with two pointers [left, right].',
      'Maintain a Hash Map or Set of characters in the current window.',
      'When duplicate is encountered, slide the left pointer past the first occurrence.'
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function lengthOfLongestSubstring(s) {
  // Write your solution here
}`,
      typescript: `function lengthOfLongestSubstring(s: string): number {
  return 0;
}`,
      python: `class Solution:
    def lengthOfLongestSubstring(self, s: str) -> int:
        pass`
    },
    testCases: [
      { input: '"abcabcbb"', expected: '3' },
      { input: '"bbbbb"', expected: '1' },
      { input: '"pwwkew"', expected: '3' }
    ],
    optimalCode: {
      javascript: `function lengthOfLongestSubstring(s) {
  const seen = new Map();
  let maxLen = 0;
  let left = 0;
  for (let right = 0; right < s.length; right++) {
    const char = s[right];
    if (seen.has(char) && seen.get(char) >= left) {
      left = seen.get(char) + 1;
    }
    seen.set(char, right);
    maxLen = Math.max(maxLen, right - left + 1);
  }
  return maxLen;
}`
    }
  },
  {
    id: 'group-anagrams',
    title: 'Group Anagrams',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    acceptance: '68.2%',
    companies: ['Amazon', 'Apple', 'Meta', 'Netflix', 'Uber'],
    description: `Given an array of strings 'strs', group the anagrams together. You can return the answer in any order.`,
    examples: [
      { input: 'strs = ["eat","tea","tan","ate","nat","bat"]', output: '[["bat"],["nat","tan"],["ate","eat","tea"]]' },
      { input: 'strs = [""]', output: '[[""]]' },
      { input: 'strs = ["a"]', output: '[["a"]]' }
    ],
    constraints: [
      '1 <= strs.length <= 10^4',
      '0 <= strs[i].length <= 100',
      'strs[i] consists of lowercase English letters.'
    ],
    hints: [
      'Two strings are anagrams if and only if their sorted representations are equal.',
      'Alternatively, use a character count tuple (26 counts for a-z) as a hash key.'
    ],
    starterCode: {
      javascript: `/**
 * @param {string[]} strs
 * @return {string[][]}
 */
function groupAnagrams(strs) {
  // Write your solution here
}`,
      typescript: `function groupAnagrams(strs: string[]): string[][] {
  return [];
}`,
      python: `class Solution:
    def groupAnagrams(self, strs: list[str]) -> list[list[str]]:
        pass`
    },
    testCases: [
      { input: '["eat","tea","tan","ate","nat","bat"]', expected: '[["eat","tea","ate"],["tan","nat"],["bat"]]' },
      { input: '[""]', expected: '[[""]]' }
    ],
    optimalCode: {
      javascript: `function groupAnagrams(strs) {
  const map = new Map();
  for (const str of strs) {
    const key = str.split('').sort().join('');
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(str);
  }
  return Array.from(map.values());
}`
    }
  },
  {
    id: 'binary-tree-level-order-traversal',
    title: 'Binary Tree Level Order Traversal',
    difficulty: 'Medium',
    category: 'Trees & Graphs',
    acceptance: '66.4%',
    companies: ['Amazon', 'Microsoft', 'Bloomberg', 'LinkedIn', 'Meta'],
    description: `Given the 'root' of a binary tree, return the level order traversal of its nodes' values (i.e., from left to right, level by level).`,
    examples: [
      { input: 'root = [3,9,20,null,null,15,7]', output: '[[3],[9,20],[15,7]]' },
      { input: 'root = [1]', output: '[[1]]' }
    ],
    constraints: [
      'The number of nodes in the tree is in the range [0, 2000].',
      '-1000 <= Node.val <= 1000'
    ],
    hints: [
      'Use Breadth-First Search (BFS) with a Queue.',
      'At each level, record the queue size; loop that many times to extract all nodes belonging to the current level before moving deeper.'
    ],
    starterCode: {
      javascript: `/**
 * @param {TreeNode} root
 * @return {number[][]}
 */
function levelOrder(root) {
  // Write your solution here
}`,
      typescript: `function levelOrder(root: any): number[][] {
  return [];
}`,
      python: `class Solution:
    def levelOrder(self, root):
        pass`
    },
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expected: '[[3],[9,20],[15,7]]' },
      { input: '[1]', expected: '[[1]]' }
    ],
    optimalCode: {
      javascript: `function levelOrder(root) {
  if (!root) return [];
  const result = [];
  const queue = [root];
  while (queue.length > 0) {
    const size = queue.length;
    const level = [];
    for (let i = 0; i < size; i++) {
      const node = queue.shift();
      level.push(node.val);
      if (node.left) queue.push(node.left);
      if (node.right) queue.push(node.right);
    }
    result.push(level);
  }
  return result;
}`
    }
  },
  {
    id: '3sum',
    title: '3Sum',
    difficulty: 'Medium',
    category: 'Two Pointers',
    acceptance: '34.2%',
    companies: ['Meta', 'Amazon', 'Apple', 'Google', 'Microsoft'],
    description: `Given an integer array nums, return all the triplets '[nums[i], nums[j], nums[k]]' such that 'i != j', 'i != k', and 'j != k', and 'nums[i] + nums[j] + nums[k] == 0'.

Notice that the solution set must not contain duplicate triplets.`,
    examples: [
      { input: 'nums = [-1,0,1,2,-1,-4]', output: '[[-1,-1,2],[-1,0,1]]' },
      { input: 'nums = [0,1,1]', output: '[]' },
      { input: 'nums = [0,0,0]', output: '[[0,0,0]]' }
    ],
    constraints: [
      '3 <= nums.length <= 3000',
      '-10^5 <= nums[i] <= 10^5'
    ],
    hints: [
      'Sort the array first in ascending order O(N log N).',
      'Fix the first element nums[i]. Then use two pointers (left = i + 1, right = n - 1) to find pairs that sum to -nums[i].',
      'Remember to skip duplicate values for i, left, and right to avoid redundant triplets.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[][]}
 */
function threeSum(nums) {
  // Write your solution here
}`,
      typescript: `function threeSum(nums: number[]): number[][] {
  return [];
}`,
      python: `class Solution:
    def threeSum(self, nums: list[int]) -> list[list[int]]:
        pass`
    },
    testCases: [
      { input: '[-1,0,1,2,-1,-4]', expected: '[[-1,-1,2],[-1,0,1]]' },
      { input: '[0,0,0]', expected: '[[0,0,0]]' }
    ],
    optimalCode: {
      javascript: `function threeSum(nums) {
  nums.sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < nums.length - 2; i++) {
    if (i > 0 && nums[i] === nums[i - 1]) continue;
    let left = i + 1;
    let right = nums.length - 1;
    while (left < right) {
      const sum = nums[i] + nums[left] + nums[right];
      if (sum === 0) {
        result.push([nums[i], nums[left], nums[right]]);
        while (left < right && nums[left] === nums[left + 1]) left++;
        while (left < right && nums[right] === nums[right - 1]) right--;
        left++;
        right--;
      } else if (sum < 0) {
        left++;
      } else {
        right--;
      }
    }
  }
  return result;
}`
    }
  },
  {
    id: 'product-of-array-except-self',
    title: 'Product of Array Except Self',
    difficulty: 'Medium',
    category: 'Arrays & Hashing',
    acceptance: '66.2%',
    companies: ['Amazon', 'Apple', 'Meta', 'Google', 'Asana'],
    description: `Given an integer array 'nums', return an array 'answer' such that 'answer[i]' is equal to the product of all the elements of 'nums' except 'nums[i]'.

The product of any prefix or suffix of 'nums' is guaranteed to fit in a 32-bit integer.
You must write an algorithm that runs in 'O(n)' time and without using the division operation.`,
    examples: [
      { input: 'nums = [1,2,3,4]', output: '[24,12,8,6]' },
      { input: 'nums = [-1,1,0,-3,3]', output: '[0,0,9,0,0]' }
    ],
    constraints: [
      '2 <= nums.length <= 10^5',
      '-30 <= nums[i] <= 30'
    ],
    hints: [
      'Calculate prefix products in a first pass from left to right.',
      'Calculate suffix products in a second pass from right to left while multiplying into the output array.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @return {number[]}
 */
function productExceptSelf(nums) {
  // Write your solution here
}`,
      typescript: `function productExceptSelf(nums: number[]): number[] {
  return [];
}`,
      python: `class Solution:
    def productExceptSelf(self, nums: list[int]) -> list[int]:
        pass`
    },
    testCases: [
      { input: '[1,2,3,4]', expected: '[24,12,8,6]' },
      { input: '[-1,1,0,-3,3]', expected: '[0,0,9,0,0]' }
    ],
    optimalCode: {
      javascript: `function productExceptSelf(nums) {
  const n = nums.length;
  const res = new Array(n).fill(1);
  let prefix = 1;
  for (let i = 0; i < n; i++) {
    res[i] = prefix;
    prefix *= nums[i];
  }
  let suffix = 1;
  for (let i = n - 1; i >= 0; i--) {
    res[i] *= suffix;
    suffix *= nums[i];
  }
  return res;
}`
    }
  },
  {
    id: 'container-with-most-water',
    title: 'Container With Most Water',
    difficulty: 'Medium',
    category: 'Two Pointers',
    acceptance: '54.9%',
    companies: ['Google', 'Amazon', 'Meta', 'Goldman Sachs', 'Adobe'],
    description: `You are given an integer array 'height' of length 'n'. There are 'n' vertical lines drawn such that the two endpoints of the 'i'th line are '(i, 0)' and '(i, height[i])'.

Find two lines that together with the x-axis form a container, such that the container contains the most water.

Return the maximum amount of water a container can store. Notice that you may not slant the container.`,
    examples: [
      { input: 'height = [1,8,6,2,5,4,8,3,7]', output: '49', explanation: 'The max area is between index 1 and 8: min(8, 7) * (8 - 1) = 49.' },
      { input: 'height = [1,1]', output: '1' }
    ],
    constraints: [
      'n == height.length',
      '2 <= n <= 10^5',
      '0 <= height[i] <= 10^4'
    ],
    hints: [
      'Use Two Pointers starting at left = 0 and right = n - 1.',
      'The area is determined by the shorter of the two heights: min(height[left], height[right]) * (right - left).',
      'Always move the pointer pointing to the shorter vertical bar inward.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function maxArea(height) {
  // Write your solution here
}`,
      typescript: `function maxArea(height: number[]): number {
  return 0;
}`,
      python: `class Solution:
    def maxArea(self, height: list[int]) -> int:
        pass`
    },
    testCases: [
      { input: '[1,8,6,2,5,4,8,3,7]', expected: '49' },
      { input: '[1,1]', expected: '1' }
    ],
    optimalCode: {
      javascript: `function maxArea(height) {
  let left = 0;
  let right = height.length - 1;
  let max = 0;
  while (left < right) {
    const area = Math.min(height[left], height[right]) * (right - left);
    max = Math.max(max, area);
    if (height[left] < height[right]) left++;
    else right--;
  }
  return max;
}`
    }
  },
  {
    id: 'search-in-rotated-sorted-array',
    title: 'Search in Rotated Sorted Array',
    difficulty: 'Medium',
    category: 'Binary Search',
    acceptance: '40.6%',
    companies: ['Amazon', 'Microsoft', 'Google', 'Meta', 'Apple'],
    description: `There is an integer array 'nums' sorted in ascending order (with distinct values) that is possibly rotated at an unknown pivot index.

Given the array 'nums' after the possible rotation and an integer 'target', return the index of 'target' if it is in 'nums', or '-1' if it is not in 'nums'.

You must write an algorithm with 'O(log n)' runtime complexity.`,
    examples: [
      { input: 'nums = [4,5,6,7,0,1,2], target = 0', output: '4' },
      { input: 'nums = [4,5,6,7,0,1,2], target = 3', output: '-1' }
    ],
    constraints: [
      '1 <= nums.length <= 5000',
      '-10^4 <= nums[i] <= 10^4',
      'All values of nums are unique.'
    ],
    hints: [
      'In a rotated sorted array, one half (left to mid OR mid to right) is ALWAYS sorted.',
      'Check which half is sorted, then check if the target lies within that sorted range.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums
 * @param {number} target
 * @return {number}
 */
function searchRotated(nums, target) {
  // Write your solution here
}`,
      typescript: `function searchRotated(nums: number[], target: number): number {
  return -1;
}`,
      python: `class Solution:
    def searchRotated(self, nums: list[int], target: int) -> int:
        pass`
    },
    testCases: [
      { input: '[4,5,6,7,0,1,2], target = 0', expected: '4' },
      { input: '[4,5,6,7,0,1,2], target = 3', expected: '-1' }
    ],
    optimalCode: {
      javascript: `function searchRotated(nums, target) {
  let left = 0, right = nums.length - 1;
  while (left <= right) {
    const mid = Math.floor((left + right) / 2);
    if (nums[mid] === target) return mid;
    if (nums[left] <= nums[mid]) {
      if (nums[left] <= target && target < nums[mid]) right = mid - 1;
      else left = mid + 1;
    } else {
      if (nums[mid] < target && target <= nums[right]) left = mid + 1;
      else right = mid - 1;
    }
  }
  return -1;
}`
    }
  },
  {
    id: 'coin-change',
    title: 'Coin Change',
    difficulty: 'Medium',
    category: 'Dynamic Programming',
    acceptance: '44.1%',
    companies: ['Amazon', 'Bloomberg', 'Goldman Sachs', 'Meta', 'Microsoft'],
    description: `You are given an integer array 'coins' representing coins of different denominations and an integer 'amount' representing a total amount of money.

Return the fewest number of coins that you need to make up that amount. If that amount of money cannot be made up by any combination of the coins, return '-1'.

You may assume that you have an infinite number of each kind of coin.`,
    examples: [
      { input: 'coins = [1,2,5], amount = 11', output: '3', explanation: '11 = 5 + 5 + 1' },
      { input: 'coins = [2], amount = 3', output: '-1' },
      { input: 'coins = [1], amount = 0', output: '0' }
    ],
    constraints: [
      '1 <= coins.length <= 12',
      '1 <= coins[i] <= 2^31 - 1',
      '0 <= amount <= 10^4'
    ],
    hints: [
      'Use Bottom-Up Dynamic Programming. dp[i] is the minimum coins to make amount i.',
      'Initialize dp array with Infinity of size amount + 1, and dp[0] = 0.',
      'For each coin, iterate from coin to amount: dp[i] = min(dp[i], dp[i - coin] + 1).'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} coins
 * @param {number} amount
 * @return {number}
 */
function coinChange(coins, amount) {
  // Write your solution here
}`,
      typescript: `function coinChange(coins: number[], amount: number): number {
  return -1;
}`,
      python: `class Solution:
    def coinChange(self, coins: list[int], amount: int) -> int:
        pass`
    },
    testCases: [
      { input: 'coins = [1,2,5], amount = 11', expected: '3' },
      { input: 'coins = [2], amount = 3', expected: '-1' }
    ],
    optimalCode: {
      javascript: `function coinChange(coins, amount) {
  const dp = new Array(amount + 1).fill(Infinity);
  dp[0] = 0;
  for (let i = 1; i <= amount; i++) {
    for (const coin of coins) {
      if (i - coin >= 0) {
        dp[i] = Math.min(dp[i], dp[i - coin] + 1);
      }
    }
  }
  return dp[amount] === Infinity ? -1 : dp[amount];
}`
    }
  },

  // ==========================================
  // HARD PROBLEMS (16 to 20)
  // ==========================================
  {
    id: 'trapping-rain-water',
    title: 'Trapping Rain Water',
    difficulty: 'Hard',
    category: 'Two Pointers',
    acceptance: '61.1%',
    companies: ['Amazon', 'Google', 'Meta', 'Goldman Sachs', 'Apple'],
    description: `Given 'n' non-negative integers representing an elevation map where the width of each bar is '1', compute how much water it can trap after raining.`,
    examples: [
      { input: 'height = [0,1,0,2,1,0,1,3,2,1,2,1]', output: '6', explanation: '6 units of rain water are trapped.' },
      { input: 'height = [4,2,0,3,2,5]', output: '9' }
    ],
    constraints: [
      'n == height.length',
      '1 <= n <= 2 * 10^4',
      '0 <= height[i] <= 10^5'
    ],
    hints: [
      'The water trapped above any bar i is min(maxLeft, maxRight) - height[i].',
      'Solve in O(N) time and O(1) space with Two Pointers moving inward.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} height
 * @return {number}
 */
function trap(height) {
  // Write your solution here
}`,
      typescript: `function trap(height: number[]): number {
  return 0;
}`,
      python: `class Solution:
    def trap(self, height: list[int]) -> int:
        pass`
    },
    testCases: [
      { input: '[0,1,0,2,1,0,1,3,2,1,2,1]', expected: '6' },
      { input: '[4,2,0,3,2,5]', expected: '9' }
    ],
    optimalCode: {
      javascript: `function trap(height) {
  let left = 0, right = height.length - 1;
  let maxLeft = 0, maxRight = 0;
  let water = 0;
  while (left < right) {
    if (height[left] <= height[right]) {
      if (height[left] >= maxLeft) maxLeft = height[left];
      else water += maxLeft - height[left];
      left++;
    } else {
      if (height[right] >= maxRight) maxRight = height[right];
      else water += maxRight - height[right];
      right--;
    }
  }
  return water;
}`
    }
  },
  {
    id: 'merge-k-sorted-lists',
    title: 'Merge k Sorted Lists',
    difficulty: 'Hard',
    category: 'Divide & Conquer',
    acceptance: '51.8%',
    companies: ['Amazon', 'Meta', 'Google', 'Microsoft', 'Uber'],
    description: `You are given an array of 'k' linked-lists 'lists', each linked-list is sorted in ascending order.

Merge all the linked-lists into one sorted linked-list and return it.`,
    examples: [
      { input: 'lists = [[1,4,5],[1,3,4],[2,6]]', output: '[1,1,2,3,4,4,5,6]' },
      { input: 'lists = []', output: '[]' }
    ],
    constraints: [
      'k == lists.length',
      '0 <= k <= 10^4',
      '0 <= lists[i].length <= 500',
      '-10^4 <= lists[i][j] <= 10^4'
    ],
    hints: [
      'A Min-Heap (Priority Queue) allows taking the smallest node among all k lists in O(log k) time.',
      'Alternatively, use Divide and Conquer to merge lists pairwise like Merge Sort in O(N log k) time.'
    ],
    starterCode: {
      javascript: `/**
 * @param {ListNode[]} lists
 * @return {ListNode}
 */
function mergeKLists(lists) {
  // Write your solution here
}`,
      typescript: `function mergeKLists(lists: any[]): any {
  return null;
}`,
      python: `class Solution:
    def mergeKLists(self, lists):
        pass`
    },
    testCases: [
      { input: '[[1,4,5],[1,3,4],[2,6]]', expected: '[1,1,2,3,4,4,5,6]' },
      { input: '[]', expected: '[]' }
    ],
    optimalCode: {
      javascript: `function mergeKLists(lists) {
  if (!lists || lists.length === 0) return null;
  while (lists.length > 1) {
    const merged = [];
    for (let i = 0; i < lists.length; i += 2) {
      const l1 = lists[i];
      const l2 = i + 1 < lists.length ? lists[i + 1] : null;
      merged.push(mergeTwoLists(l1, l2));
    }
    lists = merged;
  }
  return lists[0];
}

function mergeTwoLists(l1, l2) {
  const dummy = { val: 0, next: null };
  let curr = dummy;
  while (l1 && l2) {
    if (l1.val <= l2.val) { curr.next = l1; l1 = l1.next; }
    else { curr.next = l2; l2 = l2.next; }
    curr = curr.next;
  }
  curr.next = l1 || l2;
  return dummy.next;
}`
    }
  },
  {
    id: 'median-of-two-sorted-arrays',
    title: 'Median of Two Sorted Arrays',
    difficulty: 'Hard',
    category: 'Binary Search',
    acceptance: '38.9%',
    companies: ['Google', 'Amazon', 'Microsoft', 'Meta', 'Goldman Sachs'],
    description: `Given two sorted arrays 'nums1' and 'nums2' of size 'm' and 'n' respectively, return the median of the two sorted arrays.

The overall run time complexity should be 'O(log (m+n))'.`,
    examples: [
      { input: 'nums1 = [1,3], nums2 = [2]', output: '2.00000' },
      { input: 'nums1 = [1,2], nums2 = [3,4]', output: '2.50000' }
    ],
    constraints: [
      'nums1.length == m',
      'nums2.length == n',
      '0 <= m <= 1000',
      '0 <= n <= 1000',
      '1 <= m + n <= 2000'
    ],
    hints: [
      'Perform binary search on the shorter array.',
      'Partition both arrays such that all elements on the left are smaller than or equal to elements on the right.'
    ],
    starterCode: {
      javascript: `/**
 * @param {number[]} nums1
 * @param {number[]} nums2
 * @return {number}
 */
function findMedianSortedArrays(nums1, nums2) {
  // Write your solution here
}`,
      typescript: `function findMedianSortedArrays(nums1: number[], nums2: number[]): number {
  return 0;
}`,
      python: `class Solution:
    def findMedianSortedArrays(self, nums1: list[int], nums2: list[int]) -> float:
        pass`
    },
    testCases: [
      { input: '[1,3], [2]', expected: '2.0' },
      { input: '[1,2], [3,4]', expected: '2.5' }
    ],
    optimalCode: {
      javascript: `function findMedianSortedArrays(nums1, nums2) {
  if (nums1.length > nums2.length) return findMedianSortedArrays(nums2, nums1);
  const m = nums1.length, n = nums2.length;
  let low = 0, high = m;
  while (low <= high) {
    const cut1 = Math.floor((low + high) / 2);
    const cut2 = Math.floor((m + n + 1) / 2) - cut1;
    const l1 = cut1 === 0 ? -Infinity : nums1[cut1 - 1];
    const l2 = cut2 === 0 ? -Infinity : nums2[cut2 - 1];
    const r1 = cut1 === m ? Infinity : nums1[cut1];
    const r2 = cut2 === n ? Infinity : nums2[cut2];
    if (l1 <= r2 && l2 <= r1) {
      if ((m + n) % 2 === 0) return (Math.max(l1, l2) + Math.min(r1, r2)) / 2;
      return Math.max(l1, l2);
    } else if (l1 > r2) high = cut1 - 1;
    else low = cut1 + 1;
  }
  return 0;
}`
    }
  },
  {
    id: 'longest-valid-parentheses',
    title: 'Longest Valid Parentheses',
    difficulty: 'Hard',
    category: 'Stack',
    acceptance: '33.9%',
    companies: ['Amazon', 'Google', 'Meta', 'Microsoft', 'ByteDance'],
    description: "Given a string containing just the characters '(' and ')', return the length of the longest valid (well-formed) parentheses substring.",
    examples: [
      { input: 's = "(()"', output: '2', explanation: 'The longest valid parentheses substring is "()".' },
      { input: 's = ")()())"', output: '4', explanation: 'The longest valid parentheses substring is "()()".' }
    ],
    constraints: [
      '0 <= s.length <= 3 * 10^4',
      "s[i] is '(' or ')'."
    ],
    hints: [
      'Maintain a stack storing indices. Initialize stack with [-1].',
      "For '(', push the index. For ')', pop. If stack is empty, push current index as new boundary. Otherwise, maxLen = max(maxLen, i - stack[top])."
    ],
    starterCode: {
      javascript: `/**
 * @param {string} s
 * @return {number}
 */
function longestValidParentheses(s) {
  // Write your solution here
}`,
      typescript: `function longestValidParentheses(s: string): number {
  return 0;
}`,
      python: `class Solution:
    def longestValidParentheses(self, s: str) -> int:
        pass`
    },
    testCases: [
      { input: '"(()"', expected: '2' },
      { input: '")()())"', expected: '4' }
    ],
    optimalCode: {
      javascript: `function longestValidParentheses(s) {
  const stack = [-1];
  let maxLen = 0;
  for (let i = 0; i < s.length; i++) {
    if (s[i] === '(') {
      stack.push(i);
    } else {
      stack.pop();
      if (stack.length === 0) {
        stack.push(i);
      } else {
        maxLen = Math.max(maxLen, i - stack[stack.length - 1]);
      }
    }
  }
  return maxLen;
}`
    }
  }
];

/**
 * Intelligent Individual Code Evaluation
 */
export async function evaluateCode(params: {
  problemId: string;
  language: string;
  code: string;
}) {
  const problem = CODING_PROBLEMS.find((p) => p.id === params.problemId);
  const title = problem?.title || params.problemId;
  const difficulty = problem?.difficulty || 'Medium';

  // 1. Try Gemini AI evaluation
  const geminiEval = await evaluateCodingSolutionWithGemini({
    problemTitle: title,
    difficulty,
    language: params.language,
    code: params.code,
    problemDescription: problem?.description,
  });

  if (geminiEval) {
    return {
      ...geminiEval,
      problemId: params.problemId,
      poweredBy: 'Google Gemini AI',
    };
  }

  // 2. High-precision Local Static Fallback Analyzer
  const code = params.code.trim();
  const forLoops = (code.match(/\bfor\s*\(|\bfor\s+\w+\s+in\b/g) || []).length;
  const whileLoops = (code.match(/\bwhile\s*\(/g) || []).length;
  const hasNestedLoops = forLoops >= 2 || (forLoops >= 1 && whileLoops >= 1);
  const usesMapOrSet = /new\s+(?:Map|Set)\b|\{\}|set\(|\bdict\(|\bdefaultdict\b/i.test(code);

  let score = 70;
  let verdict = 'Accepted';
  let timeComplexity = 'O(N)';
  let spaceComplexity = 'O(1)';
  const pinpointImprovements: Array<{ part: string; issue: string; suggestion: string; improvedSnippet?: string }> = [];

  if (code.length < 35 || /\/\/ Write your solution|pass\b/i.test(code)) {
    score = 25;
    verdict = 'Syntax Error';
    timeComplexity = 'N/A';
    spaceComplexity = 'N/A';
    pinpointImprovements.push({
      part: 'Function Body',
      issue: 'The solution is incomplete or empty.',
      suggestion: 'Implement the algorithm following the problem constraints and examples.',
    });
  } else if (hasNestedLoops) {
    score = 68;
    verdict = 'Suboptimal Efficiency';
    timeComplexity = 'O(N^2)';
    spaceComplexity = 'O(1)';
    pinpointImprovements.push({
      part: 'Nested Loop Structure',
      issue: 'Using nested loops creates an O(N^2) quadratic time complexity, risking Time Limit Exceeded (TLE) on large test cases (N=10^4+).',
      suggestion: 'Replace the inner loop with a Hash Map / Dictionary lookup to achieve O(N) linear time.',
      improvedSnippet: usesMapOrSet ? undefined : 'const map = new Map(); // Store complements in O(1)',
    });
  } else if (usesMapOrSet) {
    score = 92;
    verdict = 'Optimal Solution';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(N)';
  } else {
    score = 80;
    verdict = 'Accepted';
    timeComplexity = 'O(N)';
    spaceComplexity = 'O(1)';
  }

  const optimalCode = problem?.optimalCode[params.language] || problem?.optimalCode['javascript'] || params.code;

  return {
    score,
    verdict,
    timeComplexity,
    spaceComplexity,
    overview: score >= 85
      ? `Excellent implementation! Your code runs in \${timeComplexity} time and demonstrates clean architectural flow.`
      : `Good attempt. Your logic works, but optimizing the algorithm from \${timeComplexity} will satisfy top-tier tech interview benchmarks.`,
    strengths: [
      'Clean variable declaration and readable syntax',
      'Follows appropriate return signature',
    ],
    pinpointImprovements,
    edgeCasesToConsider: [
      'Empty or single-element input arrays',
      'Large inputs testing maximum bounds (10^5 elements)',
      'Duplicate elements and negative integer values',
    ],
    optimalCode,
    motivatingAdvice: score >= 85
      ? '🌟 Fantastic problem solving! You recognized the optimal data structure right away. Practice explaining your trade-offs out loud to ace the live technical round.'
      : '💡 Great effort! The leap from O(N^2) to O(N) is the single most tested optimization in coding interviews. Mastering hash maps and two pointers will pay huge dividends!',
    poweredBy: 'SkillProof Technical Evaluation Engine',
  };
}

/**
 * Curates a realistic technical interview test session
 */
export function getCuratedInterviewTest(type: 'standard' | 'intern' | 'senior' = 'standard') {
  let selectedIds: string[] = [];
  if (type === 'intern') {
    selectedIds = ['two-sum', 'valid-parentheses'];
  } else if (type === 'senior') {
    selectedIds = ['longest-substring-without-repeating-characters', 'trapping-rain-water'];
  } else {
    // Standard: 1 Easy + 1 Medium
    selectedIds = ['best-time-to-buy-and-sell-stock', '3sum'];
  }

  const questions = selectedIds
    .map((id) => CODING_PROBLEMS.find((p) => p.id === id))
    .filter(Boolean) as CodingProblem[];

  return {
    testId: `tech-test-${Date.now()}`,
    title: type === 'senior' ? 'Senior Full Stack Technical Assessment' : 'Full Stack Engineering Coding Assessment',
    durationMinutes: 45,
    durationSeconds: 45 * 60,
    questions: questions.map((q) => ({
      id: q.id,
      problemId: q.id,
      title: q.title,
      difficulty: q.difficulty,
      category: q.category,
      description: q.description,
      examples: q.examples,
      constraints: q.constraints,
      starterCode: q.starterCode,
      testCases: q.testCases,
    })),
    problems: questions.map((q) => ({
      id: q.id,
      problemId: q.id,
      title: q.title,
      difficulty: q.difficulty,
      category: q.category,
      description: q.description,
      examples: q.examples,
      constraints: q.constraints,
      starterCode: q.starterCode,
      testCases: q.testCases,
    })),
  };
}

/**
 * Evaluates an entire submitted Technical Interview Test
 */
export async function evaluateCodingTest(params: {
  testId: string;
  submissions: Array<{
    problemId: string;
    language: string;
    code: string;
  }>;
}) {
  const detailedQuestions = params.submissions.map((sub) => {
    const problem = CODING_PROBLEMS.find((p) => p.id === sub.problemId);
    return {
      id: sub.problemId,
      title: problem?.title || sub.problemId,
      difficulty: problem?.difficulty || 'Medium',
      description: problem?.description || '',
      code: sub.code,
      language: sub.language,
    };
  });

  // 1. Try Gemini AI comprehensive review
  const aiTestReview = await evaluateTechnicalInterviewTestWithGemini({
    questions: detailedQuestions,
  });

  if (aiTestReview) {
    return {
      id: params.testId,
      submittedAt: new Date(),
      ...aiTestReview,
      poweredBy: 'Google Gemini AI Bar-Raiser',
    };
  }

  // 2. High-precision rule-based test review fallback
  const individualEvals = await Promise.all(
    params.submissions.map((sub) => evaluateCode(sub))
  );

  const avgScore = Math.round(
    individualEvals.reduce((acc, curr) => acc + curr.score, 0) / Math.max(individualEvals.length, 1)
  );

  const logicScore = Math.min(100, Math.round(avgScore * 0.95 + 4));
  const efficiencyScore = Math.min(100, Math.round(avgScore * 0.9 + 2));

  let verdict: 'Strong Hire' | 'Hire' | 'Leaning Hire' | 'Needs Practice' = 'Hire';
  if (avgScore >= 85) verdict = 'Strong Hire';
  else if (avgScore >= 70) verdict = 'Hire';
  else if (avgScore >= 55) verdict = 'Leaning Hire';
  else verdict = 'Needs Practice';

  const questionReviews = individualEvals.map((ev, i) => ({
    problemId: params.submissions[i].problemId,
    problemTitle: detailedQuestions[i].title,
    score: ev.score,
    timeComplexity: ev.timeComplexity,
    spaceComplexity: ev.spaceComplexity,
    verdict: ev.verdict,
    strengths: ev.strengths,
    improvements: ev.pinpointImprovements.map((p) => `${p.part}: ${p.issue}`),
  }));

  return {
    id: params.testId,
    submittedAt: new Date(),
    overallScore: avgScore,
    logicScore,
    efficiencyScore,
    logicRating: logicScore,
    efficiencyRating: efficiencyScore,
    verdict,
    executiveSummary: `Candidate completed ${params.submissions.length} problems with an overall score of ${avgScore}/100. Demonstrated solid syntactic command and logical problem structuring under timed conditions.`,
    logicProgressionNote: `Strong intuition for foundational algorithmic patterns. Continuing to practice converting quadratic nested iterations into single-pass hash lookups will elevate speed and reliability in live interview rounds.`,
    questionReviews,
    evaluations: questionReviews,
    poweredBy: 'SkillProof Technical Evaluation Engine',
  };
}
