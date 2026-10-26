import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Compass, Home, ArrowLeft } from 'lucide-react';
import { ROUTES } from '../config/routes';
import { Button } from '../components/common/Button';
import { Card } from '../components/common/Card';

export const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4 py-16">
      <Card variant="elevated" className="max-w-md w-full p-8 text-center space-y-6">
        <div className="w-20 h-20 rounded-2xl bg-nocturne text-starlight flex items-center justify-center mx-auto text-3xl font-black border border-nocturne">
          404
        </div>

        <div>
          <h1 className="text-xl sm:text-2xl font-black text-nocturne">Page Not Found</h1>
          <p className="text-xs sm:text-sm text-wisteria mt-2 leading-relaxed">
            The examination notice, gazette record, or URL you requested is not available in our government directory.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
          <Button
            variant="outline"
            size="md"
            className="w-full sm:w-auto"
            onClick={() => navigate(-1)}
            leftIcon={<ArrowLeft className="w-4 h-4" />}
          >
            Go Back
          </Button>

          <Link to={ROUTES.HOME} className="w-full sm:w-auto">
            <Button
              variant="primary"
              size="md"
              className="w-full"
              leftIcon={<Home className="w-4 h-4" />}
            >
              Portal Home
            </Button>
          </Link>

          <Link to={ROUTES.EXAMS} className="w-full sm:w-auto">
            <Button
              variant="secondary"
              size="md"
              className="w-full"
              leftIcon={<Compass className="w-4 h-4" />}
            >
              Browse Exams
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
};
