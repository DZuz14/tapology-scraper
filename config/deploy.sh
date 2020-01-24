#!/bin/bash
rsync -avz --exclude-from './config/exclude.txt' ./ mma-break:/root