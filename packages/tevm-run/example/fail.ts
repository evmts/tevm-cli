// Exits non-zero so end-to-end tests can exercise tevm-run's failure path.
console.log('about to fail')
console.error('intentional failure')
process.exit(3)
