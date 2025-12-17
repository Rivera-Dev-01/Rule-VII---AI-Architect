# Google Colab Training Setup

## Step 1: Install Unsloth
```python
!pip install "unsloth[colab-new] @ git+https://github.com/unslothai/unsloth.git"
!pip install --no-deps "xformers<0.0.27" "trl<0.9.0" peft accelerate bitsandbytes
```

## Step 2: Load Model
```python
from unsloth import FastLanguageModel
import torch

model, tokenizer = FastLanguageModel.from_pretrained(
    model_name = "unsloth/Meta-Llama-3.1-8B-Instruct",
    max_seq_length = 2048,
    dtype = None,
    load_in_4bit = True,
)
```

## Step 3: Prepare Dataset
Upload your `arch_mentor_dataset.jsonl` file to Colab

## Step 4: Train
See full notebook in repository
