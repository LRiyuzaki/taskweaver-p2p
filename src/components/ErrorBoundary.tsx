
import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './ui/card';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  resetCondition?: any[];
}

interface State {
  hasError: boolean;
  error: Error | null;
}

class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null
    };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('Error caught by ErrorBoundary:', error, errorInfo);
    if (this.props.onError) {
      this.props.onError(error, errorInfo);
    }
  }

  componentDidUpdate(prevProps: Props): void {
    // Reset the error state if resetCondition changes
    if (
      this.state.hasError &&
      this.props.resetCondition &&
      prevProps.resetCondition &&
      JSON.stringify(prevProps.resetCondition) !== JSON.stringify(this.props.resetCondition)
    ) {
      this.setState({ hasError: false, error: null });
    }
  }

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="shadow-lg border-red-200">
          <CardHeader className="bg-red-50 dark:bg-red-900/20">
            <CardTitle className="text-red-600 dark:text-red-400 flex items-center">
              <AlertCircle className="h-5 w-5 mr-2" />
              Something went wrong
            </CardTitle>
            <CardDescription>
              An error occurred in this component
            </CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-gray-100 dark:bg-gray-800 p-4 rounded overflow-auto max-h-32 text-sm">
              {this.state.error && this.state.error.toString()}
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              variant="outline" 
              onClick={() => this.setState({ hasError: false, error: null })}
              className="flex items-center"
            >
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </CardFooter>
        </Card>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
